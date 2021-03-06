// (C) 2007-2019 GoodData Corporation
import { loadProjectMetadata } from "../loadProjectMetadata";

jest.mock("@gooddata/gd-bear-client");

describe("loadProjectMetadata", () => {
    it("should transfer project ID", async () => {
        const result = await loadProjectMetadata("test");

        expect(result.projectId).toEqual("test");
    });

    it("should load ldm", async () => {
        const result = await loadProjectMetadata("test");

        expect(result.catalog).toMatchSnapshot();
    });

    it("should load date data sets", async () => {
        const result = await loadProjectMetadata("test");

        expect(result.dateDataSets).toMatchSnapshot();
    });

    it("should load visualizations", async () => {
        const result = await loadProjectMetadata("test");

        expect(result.insights).toMatchSnapshot();
    });
});
