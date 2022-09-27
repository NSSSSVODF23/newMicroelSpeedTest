import {Injectable} from "@angular/core";
import {ApolloQueryResult} from "@apollo/client/core";
import {Apollo, gql} from "apollo-angular";
import {map, Observable} from "rxjs";
import {Device} from "src/app/common/service/device-info.service";
import {DeviceFilter} from "src/app/common/transport/filters/device-filter";
import {UpdateProvider} from "../../common/transport/models/update-provider";
import {QueryLimit} from "../../common/transport/models/query-limit";
import {Page} from "../../common/transport/models/page";
import {FilterRequestParams} from "../../common/interfaces/pageable";

interface GetFilteredDevices {
    getFilteredDevices: Device[];
    getTotalDevices: number;
}

@Injectable({
    providedIn: "root",
})
export class DeviceService {
    constructor(readonly apollo: Apollo) {
    }

    public get(
        filter: FilterRequestParams<Device>
    ): Observable<Page<Device>> {
        return this.apollo.query<any>({
            query: gql`
                query getDevices($matchingObject: IDevice, $limit: IPagination) {
                    getDevices(matchingObject: $matchingObject, limit: $limit) {
                        content {
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
                            isPro
                        }
                        totalElements
                    }
                }
            `,
            variables: {
                matchingObject: filter.matchingObject,
                limit: filter.limits
            },
            fetchPolicy: "network-only",
        }).pipe(map(data => data.data.getDevices as Page<Device>));
    }

    public setDeviceMode(deviceId: string, mode: boolean) {
        this.apollo.mutate(
            {
                mutation: gql`
                    mutation setDeviceMode($deviceId: String, $mode: Boolean){
                        setDeviceMode(deviceId: $deviceId, mode: $mode)
                    }
                `, variables: {deviceId, mode}
            }
        ).subscribe()
    }

    public update(): Observable<UpdateProvider<Device>> {
        return this.apollo.subscribe<any>({
            query: gql`
                subscription {
                    updateDevices {
                        updateType
                        object {
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
                            isPro
                        }
                    }
                }
            `,
        }).pipe(map(data => data.data.updateDevices))
    }
}
