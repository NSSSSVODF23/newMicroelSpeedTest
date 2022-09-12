import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map, Observable } from "rxjs";
import { PerformanceInfo } from "src/app/common/transport/models/performance";

const getPerformance = gql`
	subscription {
		getPerformance {
			receivedChartData {
				x
				y
			}
			transceivedChartData {
				x
				y
			}
			cpuChartData {
				x
				y
			}
			memoryChartData {
				x
				y
			}
			totalMemoryChartData {
				x
				y
			}
		}
	}
`;

@Injectable({
	providedIn: "root",
})
export class DashboardService {
	constructor(readonly apollo: Apollo) {}

	/**
	 * getPerformance
	 */

	public getPerformance(): Observable<PerformanceInfo> {
		return this.apollo
			.subscribe<any>({
				query: getPerformance,
			})
			.pipe(map((data) => data.data?.getPerformance));
	}
}
