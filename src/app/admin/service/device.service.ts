import { Injectable } from "@angular/core";
import { ApolloQueryResult } from "@apollo/client/core";
import { Apollo, gql } from "apollo-angular";
import { map, Observable } from "rxjs";
import { DeviceInfo } from "src/app/common/service/device-info.service";
import { DeviceFilter } from "src/app/common/transport/filters/device-filter";

interface GetFilteredDevices {
	getFilteredDevices: DeviceInfo[];
	getTotalDevices: number;
}

@Injectable({
	providedIn: "root",
})
export class DeviceService {
	constructor(readonly apollo: Apollo) {}

	public getFilteredDevices(
		filter: DeviceFilter,
	): Observable<ApolloQueryResult<GetFilteredDevices>> {
		return this.apollo.query<GetFilteredDevices>({
			query: gql`
				query getDevice($filter: DeviceFilter) {
					
					getFilteredDevices(filter: $filter) {
						deviceId
						ip
						hostname
						system
						platform
						userAgent
						isMobile
						measures {
							measureId
							downloadSpeed
							uploadSpeed
						}
					}
					getTotalDevices(filter: $filter)
				}
			`,
			variables: {
				filter,
			},
			fetchPolicy: "network-only",
		});
	}
}
