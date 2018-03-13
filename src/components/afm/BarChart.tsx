// (C) 2007-2018 GoodData Corporation
import {
    dataSourceProvider,
    IDataSourceProviderProps
} from './DataSourceProvider';

export {
    IDataSourceProviderProps
};

import { ICommonChartProps } from '../core/base/BaseChart';
import { BarChart as CoreBarChart } from '../core/BarChart';
import { generateDefaultDimensions } from './afmHelper';

export const BarChart = dataSourceProvider<ICommonChartProps>(CoreBarChart, generateDefaultDimensions, 'BarChart');
