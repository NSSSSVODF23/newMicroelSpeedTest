export interface ChartPoint {
	x: Date;
	y: number;
}

export interface PerformanceInfo {
	receivedChartData?: ChartPoint[];
	transceivedChartData?: ChartPoint[];
	cpuChartData?: ChartPoint[];
	memoryChartData?: ChartPoint[];
	totalMemoryChartData?: ChartPoint[];
}
