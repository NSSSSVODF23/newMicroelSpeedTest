import { Injectable } from "@angular/core";
import { Apollo, gql } from "apollo-angular";
import { map, Observable } from "rxjs";
import { ApolloQueryResult, FetchResult } from "@apollo/client/core";
import { ResultPageComponent } from "src/app/public/pages/result-page/result-page.component";
import { Measure } from "../../common/transport/models/measure";
import { MeasureFilter } from "src/app/common/transport/filters/measure-filter";
import { AuthService } from "./auth.service";

interface GetMeasure {
	getMeasure: Measure;
}

interface GetMeasures {
	getMeasures: Measure[];
	getNumberOfFilteredMeasures: number;
}

interface GetNewMeasure {
	getNewMeasure: Measure;
}

interface GetBeginningMeasures {
	getBeginningMeasures: Measure[];
}

interface GetFilteredMeasures {
	getFilteredMeasures: Measure[];
	getTotalMeasures: number;
}

/** Устанавливает влаг isBeginning в pipe(map) получения текущих замеров от сервера */
const mapToBeginningMeasure = (measures: any) => {
	let tempMeasures: any = {
		data: {
			getBeginningMeasures: measures.data?.getBeginningMeasures.map(
				(measure: Measure) => {
					const beginningMeasure = Object.assign({}, measure);
					beginningMeasure.isBeginning = true;
					return beginningMeasure;
				},
			),
		},
		loading: measures.loading,
		network: measures.network,
	};
	return tempMeasures;
};

@Injectable({
	providedIn: "root",
})
export class MeasureService {
	constructor(readonly apollo: Apollo) {}

	public getMeasureById(id: number): Observable<ApolloQueryResult<GetMeasure>> {
		return this.apollo.query<GetMeasure>({
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
		});
	}

	public getMeasures(): Observable<FetchResult<GetMeasures>> {
		return this.apollo.query<GetMeasures>({
			query: gql`
				{
					getAllMeasures {
						measureId
						device {
							deviceId
							ip
							hostname
							system
							platform
							userAgent
							isMobile
						}
						session {
							sessionId
							mac
							login
							ip
							vlan
							house {
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
						downloadSpeedChart {
							stamp
							speed
						}
						uploadSpeed
						uploadStability
						uploadLoss
						uploadSpeedChart {
							stamp
							speed
						}
						isUsed
						isFailed
					}
				}
			`,
		});
	}

	public getBeginningMeasuresSubscription(): Observable<
		FetchResult<GetBeginningMeasures>
	> {
		return this.apollo
			.subscribe<GetBeginningMeasures>({
				query: gql`
					subscription {
						getBeginningMeasures {
							measureId
							device {
								deviceId
								ip
								hostname
								system
								platform
								userAgent
								isMobile
							}
							session {
								sessionId
								mac
								login
								ip
								vlan
								house {
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
							downloadSpeedChart {
								stamp
								speed
							}
							uploadSpeed
							uploadStability
							uploadLoss
							uploadSpeedChart {
								stamp
								speed
							}
							isUsed
							isFailed
						}
					}
				`,
			})
			.pipe(map(mapToBeginningMeasure));
	}
	public getBeginningMeasures(): Observable<
		ApolloQueryResult<GetBeginningMeasures>
	> {
		return this.apollo
			.query<GetBeginningMeasures>({
				query: gql`
					{
						getBeginningMeasures {
							measureId
							device {
								deviceId
								ip
								hostname
								system
								platform
								userAgent
								isMobile
							}
							session {
								sessionId
								mac
								login
								ip
								vlan
								house {
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
							downloadSpeedChart {
								stamp
								speed
							}
							uploadSpeed
							uploadStability
							uploadLoss
							uploadSpeedChart {
								stamp
								speed
							}
							isUsed
							isFailed
						}
					}
				`,
				fetchPolicy: "network-only",
			})
			.pipe(map(mapToBeginningMeasure));
	}

	public getFilteredMeasuresSubscription(
		filter: MeasureFilter,
	): Observable<FetchResult<GetFilteredMeasures>> {
		return this.apollo.subscribe<GetFilteredMeasures>({
			query: gql`
				subscription getFilteredMeasures($filter: MeasureFilter) {
					getFilteredMeasures(filter: $filter) {
						measureId
						device {
							deviceId
							ip
							hostname
							system
							platform
							userAgent
							isMobile
						}
						session {
							sessionId
							mac
							login
							ip
							vlan
							house {
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
						downloadSpeedChart {
							stamp
							speed
						}
						uploadSpeed
						uploadStability
						uploadLoss
						uploadSpeedChart {
							stamp
							speed
						}
						isUsed
						isFailed
					}
				}
			`,
			variables: {
				filter,
			},
		});
	}

	public getNumberOfFilteredMeasuresSubscription(): Observable<
		FetchResult<GetFilteredMeasures>
	> {
		return this.apollo.subscribe<GetFilteredMeasures>({
			query: gql`
				subscription getTotalMeasures($filter: MeasureFilter) {
					getTotalMeasures(filter: $filter)
				}
			`,
			variables: {
				filter: {},
			},
		});
	}

	public getFilteredMeasures(
		filter: MeasureFilter,
	): Observable<ApolloQueryResult<GetFilteredMeasures>> {
		return this.apollo.query<GetFilteredMeasures>({
			query: gql`
				query getFilteredMeasures($filter: MeasureFilter) {
					getFilteredMeasures(filter: $filter) {
						measureId
						device {
							deviceId
							ip
							hostname
							system
							platform
							userAgent
							isMobile
						}
						session {
							sessionId
							mac
							login
							ip
							vlan
							house {
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
						downloadSpeedChart {
							stamp
							speed
						}
						uploadSpeed
						uploadStability
						uploadLoss
						uploadSpeedChart {
							stamp
							speed
						}
						isUsed
						isFailed
					}
					getTotalMeasures(filter: $filter)
				}
			`,
			variables: {
				filter,
			},
			fetchPolicy: "network-only",
		});
	}
}
