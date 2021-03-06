// (C) 2007-2019 GoodData Corporation

import flatMap = require("lodash/flatMap");
import unionBy = require("lodash/unionBy");
import isArray = require("lodash/isArray");
import isObject = require("lodash/isObject");
import { defFingerprint, IInsight, IInsightDefinition, insightTitle } from "@gooddata/sdk-model";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import allScenarios from "../../scenarios";
import { IScenario } from "../../src";
import { ChartInteractions, DataViewRequests } from "../_infra/backendWithCapturing";
import { createInsightDefinitionForChart } from "../_infra/insightFactory";
import { mountChartAndCaptureNormalized } from "../_infra/render";
import { mountInsight } from "../_infra/renderPlugVis";

type AllScenariosType = [string, string, IScenario<any>];

const StoreEnvVar = "GDC_STORE_DEFS";
const ExecutionsDir = initializeStore(process.env[StoreEnvVar], "executions");
const InsightsDir = initializeStore(process.env[StoreEnvVar], "insights");
const DefinitionFileName = "definition.json";
const RequestsFileName = "requests.json";
const ScenariosFileName = "scenarios.json";
const InsightIndexFileName = "insights.json";
const InsightFileName = "obj.json";

function toJsonString(obj: any): string {
    return JSON.stringify(obj, null, 4);
}

function writeAsJsonSync(file: string, obj: any) {
    return fs.writeFileSync(file, toJsonString(obj), { encoding: "utf-8" });
}

function readJsonSync(file: string): any {
    return JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
}

function initializeStore(rootDir: string | undefined, subdir: string): string | undefined {
    if (!rootDir) {
        // tslint:disable-next-line:no-console
        console.warn(
            `The smoke-and-capture suite is not configured with store root. The suite will run but will not produce any results for ${subdir}`,
        );

        // no store dir => no problem, definitions will not be stored
        return;
    }

    const dir = path.join(rootDir, subdir);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });

        return dir;
    }

    if (!fs.statSync(dir).isDirectory()) {
        // tslint:disable-next-line:no-console
        console.error(
            `Path ${dir} already exists but is not a directory. Not going to store any definitions.`,
        );

        return;
    }

    return dir;
}

function storeRequests(interactions: ChartInteractions, recordingDir: string): void {
    const requestsFile = path.join(recordingDir, RequestsFileName);
    const { dataViewRequests } = interactions;

    let requests: DataViewRequests = {
        allData: false,
        windows: [],
    };

    if (fs.existsSync(requestsFile)) {
        try {
            const existingRequests = readJsonSync(requestsFile);

            if (!isObject(existingRequests)) {
                // tslint:disable-next-line:no-console
                console.warn(
                    `The requests file ${requestsFile} seems invalid. It should contain object describing what data view requests should be captured for the recording.`,
                );
            } else {
                requests = existingRequests as DataViewRequests;
            }
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.warn("Unable to read or parse exec requests file in ", requestsFile);
        }
    }

    if (dataViewRequests.allData) {
        requests.allData = true;
    }

    if (dataViewRequests.windows) {
        requests.windows = unionBy(dataViewRequests.windows, requests.windows, val => {
            return `${val.offset.join(",")}-${val.size.join(",")}`;
        });
    }

    writeAsJsonSync(requestsFile, requests);
}

function storeDefinition(interactions: ChartInteractions): string {
    const { triggeredExecution } = interactions;
    const fp = defFingerprint(triggeredExecution!);
    const recordingDir = path.join(ExecutionsDir!, fp);

    if (!fs.existsSync(recordingDir)) {
        fs.mkdirSync(recordingDir);
    }

    writeAsJsonSync(path.join(recordingDir, DefinitionFileName), { ...triggeredExecution, buckets: [] });

    storeRequests(interactions, recordingDir);

    return recordingDir;
}

function storeScenarioMetadata(
    recordingDir: string,
    vis: string,
    scenarioName: string,
    interactions: ChartInteractions,
) {
    const scenariosFile = path.join(recordingDir, ScenariosFileName);

    let scenarios = [];

    if (fs.existsSync(scenariosFile)) {
        try {
            const existingScenarios = readJsonSync(scenariosFile);

            if (!isArray(existingScenarios)) {
                // tslint:disable-next-line:no-console
                console.warn(
                    `The scenarios file ${scenariosFile} seems invalid. It should contain array of scenario metadata.`,
                );
            } else {
                scenarios = existingScenarios;
            }
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.warn("Unable to read or parse exec definition scenario file in ", scenariosFile);
        }
    }

    if (scenarios.find(s => s.vis === vis && s.scenario === scenarioName)) {
        // scenario is already mentioned in the metadata; bail out there is nothing to do
        return;
    }

    const { normalizationState } = interactions;

    if (normalizationState) {
        /*
         * If execution normalization took place, the scenario definition must contain the original execution definition
         * and mapping between normalized localIds and original localIds. The normalized execution does not
         * have to be stored together with scenario: it's already stored as part of execution definition.
         *
         * This must be done so that directly accessing recordedDataView can perform denormalization as well.
         *
         * The recordedDataView() is an important piece of the test support and must work predictably and without
         * caveats.
         */
        scenarios.push({
            vis,
            scenario: scenarioName,
            originalExecution: normalizationState.original,
            n2oMap: normalizationState.n2oMap,
        });
    } else {
        const definition = interactions.triggeredExecution;

        scenarios.push({ vis, scenario: scenarioName, buckets: definition!.buckets });
    }

    writeAsJsonSync(scenariosFile, scenarios);
}

/**
 * This will store execution definition for particular visualization scenario. The execution definition
 * will be stored in directory named after definition's fingerprint. The directory will contain 'definition.json'
 * file with the actual definition and 'scenarios.json' file that enumerates test scenarios where this definition
 * is used.
 *
 * @param scenario - detail about test scenario
 * @param interactions - chart interactions with the backend
 * @param plugVizInteractions - plug viz interactions with the backend
 */
function storeScenarioDefinition(
    scenario: IScenario<any>,
    interactions: ChartInteractions,
    plugVizInteractions?: ChartInteractions,
) {
    if (!ExecutionsDir) {
        return;
    }

    const { triggeredExecution: componentExecution } = interactions;
    const { triggeredExecution: plugVizExecution } = plugVizInteractions ?? {};
    const recordingDir = storeDefinition(interactions);

    if (plugVizExecution && defFingerprint(componentExecution!) !== defFingerprint(plugVizExecution!)) {
        /*
         * As-is, react components and plug viz for the same bucket MAY lead to different executions
         * due to plug viz auto-magically adding sorts (desired UX). different sorts in exec means different
         * execution. if that happens, make sure the exec definition for the plug viz variant of the
         * scenario is also stored.
         */
        storeDefinition(plugVizInteractions!);
    }

    if (!scenario.tags.includes("mock-no-scenario-meta")) {
        storeScenarioMetadata(recordingDir, scenario.vis, scenario.name, interactions);
    }
}

function storeInsight(scenario: IScenario<any>, def: IInsightDefinition) {
    if (!InsightsDir) {
        return;
    }

    const id = scenario.insightId;
    const persistentInsight: IInsight = scenario.insightConverter({
        insight: { identifier: id, uri: id, ...def.insight },
    });
    const insightDir = path.join(InsightsDir!, id);

    if (!fs.existsSync(insightDir)) {
        fs.mkdirSync(insightDir);
    }

    writeAsJsonSync(path.join(insightDir, InsightFileName), persistentInsight);

    const insightIndexFile = path.join(InsightsDir!, InsightIndexFileName);
    const insightIndex = fs.existsSync(insightIndexFile) ? readJsonSync(insightIndexFile) : {};

    /*
     * Inclusion of scenario information in the insight recording definition makes the mock-handling tool
     * to include the insight in Insight index - meaning the insight can be accessed programatically such
     * as 'Insight.BarChart.TwoMeasures' etc.
     */
    const shouldIncludeScenario = !scenario.tags.includes("mock-no-scenario-meta");
    const scenarioInfo = shouldIncludeScenario ? { visName: scenario.vis, scenarioName: scenario.name } : {};

    insightIndex[id] = {
        ...scenarioInfo,
        comment: `Auto-generated insight for test scenario ${insightTitle(def)}.`,
    };

    writeAsJsonSync(insightIndexFile, insightIndex);

    return;
}

const PlugVisUnsupported: string[] = [];

describe("all scenarios", () => {
    const Scenarios: AllScenariosType[] = flatMap(allScenarios, (s): AllScenariosType[] => {
        const testInputs: Array<IScenario<any>> = s.asScenarioList();

        return testInputs.map(t => {
            return [t.vis, t.name, t];
        });
    });

    it.each(Scenarios)("%s %s should lead to execution", async (vis, scenarioName, scenario) => {
        const interactions = await mountChartAndCaptureNormalized(scenario.component, scenario.propsFactory);

        expect(interactions.triggeredExecution).toBeDefined();
        expect(interactions.normalizationState).toBeDefined();

        if (
            interactions.dataViewRequests.windows === undefined &&
            interactions.dataViewRequests.allData === undefined
        ) {
            fail(
                `Mounting ${vis} for scenario ${scenarioName} did not lead to request of data from server. The smoke-and-capture suite now does not know what to store in the recording definition as it is unclear if the scenario needs all data or some particular window of data.`,
            );
            return;
        }

        if (scenario.tags.includes("mock-no-insight") || PlugVisUnsupported.indexOf(vis) >= 0) {
            /*
             * Some visualizations may not support plug vis yet. For those, just store scenario
             * definition and halt.
             */
            storeScenarioDefinition(scenario, interactions);
        } else {
            /*
             * For others, create insight object, try to mount pluggable visualization for
             * the respective visualization, capture execution definition and store everything.
             */
            const insight = createInsightDefinitionForChart(vis, scenarioName, interactions);

            /*
             * note: to allow PV executions and react component executions to hit the same fingerprints, this function
             * must also use the normalizing backend.
             */
            const plugVizInteractions = await mountInsight(insight, true);

            storeScenarioDefinition(scenario, interactions, plugVizInteractions);
            storeInsight(scenario, insight);
        }
    });
});
