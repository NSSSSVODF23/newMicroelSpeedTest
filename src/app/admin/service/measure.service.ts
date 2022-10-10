import {Injectable} from "@angular/core";
import {Apollo, gql} from "apollo-angular";
import {map, Observable} from "rxjs";
import {Measure} from "../../common/transport/models/measure";
import {UpdateProvider} from "../../common/transport/models/update-provider";
import {FilterRequestParams} from "../../common/interfaces/pageing/pageable";
import {Page} from "../../common/transport/models/page";

@Injectable({
    providedIn: "root",
})
export class MeasureService {
    constructor(readonly apollo: Apollo) {
    }

    public getMeasureById(id: number): Observable<Measure> {
        return this.apollo.query<any>({
            query: gql`
                {
                    getMeasure(id: ${id}) {
                        measureId
                        device{
                            deviceId
                            ip
                            hostname
                            system
                            platform
                            userAgent
                            isMobile
                        }
                        session{
                            sessionId
                            mac
                            login
                            ip
                            vlan
                            house{
                                houseId
                                vlan
                                address
                            }
                        }
                        created
                        connectionType
                        ping
                        pingJitter
                        downloadSpeed
                        downloadStability
                        downloadLoss
                        downloadSpeedChart{
                            stamp
                            speed
                        }
                        uploadSpeed
                        uploadStability
                        uploadLoss
                        uploadSpeedChart{
                            stamp
                            speed
                        }
                        isUsed
                        isFailed
                    }
                }
            `,
        }).pipe(map(data => data.data.getMeasure));
    }

    public getBeginning(): Observable<Measure[]> {
        return this.apollo
        .query<any>({
            query: gql`
                {
                    getBeginningMeasures {
                        measureId
                        session {
                            mac
                            login
                            ip
                            house {
                                address
                            }
                        }
                        created
                        connectionType
                        downloadSpeed
                        uploadSpeed
                        isStarted
                        beginningId
                    }
                }
            `,
            fetchPolicy: "network-only",
        })
        .pipe(map(data => [...data.data.getBeginningMeasures]));
    }

    public updateBeginning(): Observable<UpdateProvider<Measure>> {
        return this.apollo.subscribe<any>({
            query: gql`
                subscription {
                    updateBeginningMeasures{
                        updateType
                        object {
                            measureId
                            session {
                                mac
                                login
                                ip
                                house {
                                    address
                                }
                            }
                            created
                            connectionType
                            downloadSpeed
                            uploadSpeed
                            isStarted
                            beginningId
                        }
                    }
                }
            `
        }).pipe(map(data => data.data.updateBeginningMeasures));
    }

    public update(): Observable<UpdateProvider<Measure>> {
        return this.apollo.subscribe<any>({
            query: gql`
                subscription {
                    updateMeasures{
                        updateType
                        object {
                            measureId
                            session {
                                mac
                                login
                                ip
                                house {
                                    houseId
                                    address
                                }
                            }
                            created
                            connectionType
                            downloadSpeed
                            uploadSpeed
                            isStarted
                        }
                    }
                }
            `
        }).pipe(map(data => data.data.updateMeasures))
    }

    public get(filter: FilterRequestParams<Measure>): Observable<Page<Measure>> {
        return this.apollo.query<any>({
            query: gql`
                query getMeasures($matchingObject: IMeasure, $limits: IPagination, $dateFilter: ITimeRange) {
                    getMeasures(matchingObject: $matchingObject, limits: $limits, dateFilter: $dateFilter) {
                        content {
                            measureId
                            session {
                                mac
                                login
                                ip
                                house {
                                    houseId
                                    address
                                }
                            }
                            created
                            connectionType
                            downloadSpeed
                            uploadSpeed
                            isStarted
                        }
                        totalElements
                    }
                }
            `,
            variables: {
                matchingObject: filter.matchingObject,
                limits: filter.limits,
                dateFilter: filter.extras
            },
            fetchPolicy: "network-only",
        }).pipe(map(data => data.data.getMeasures as Page<Measure>));
    }
}
