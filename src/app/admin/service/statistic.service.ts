import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {map, Observable} from "rxjs";
import {
    ActiveSession,
    CpuUtil,
    DateIntegerPoint,
    DayIntegerPoint,
    GroupCTypeDateIntegerPoint,
    GroupCTypeDayIntegerPoint,
    GroupCTypeHourIntegerPoint,
    GroupCTypeStringIntegerPoint,
    GroupStringDayIntegerPoint,
    HourIntegerPoint,
    NetworkUtil,
    RamUtil, StringDoublePoint,
    StringIntegerPoint,
    TimeNumberPoint
} from "../../common/transport/models/statistics";
import {TimeRange} from "../../common/method/time";
import {MeasureConnectionTypes} from "../../common/transport/enums/connection-types";
import {Measure} from "../../common/transport/models/measure";
import {UpdateProvider} from "../../common/transport/models/update-provider";


@Injectable({
    providedIn: 'root'
})
export class StatisticService {

    constructor(readonly apollo: Apollo) {
    }

    measuresCountsInAddresses(timeRange: TimeRange): Observable<GroupCTypeStringIntegerPoint[]> {
        return this.apollo.query<any>({
            query: gql`
                query getMeasuringCountsInAddresses($timeRange: ITimeRange){
                    getMeasuringCountsInAddresses(timeRange: $timeRange){
                        x
                        y
                        g
                    }
                }
            `,
            fetchPolicy: "network-only",
            variables: {timeRange: {start: timeRange[0], end: timeRange[1]}}
        }).pipe(map(data => data.data.getMeasuringCountsInAddresses.map((point: any) => {
            return {...point, g: MeasureConnectionTypes[point.g]}
        })))
    }

    measuresCountsInDate(timeRange: TimeRange): Observable<GroupCTypeDateIntegerPoint[]> {
        return this.apollo.query<any>(
            {
                query: gql`
                    query getMeasuringCountsInDate($timeRange: ITimeRange){
                        getMeasuringCountsInDate(timeRange: $timeRange){
                            x
                            y
                            g
                        }
                    }
                `,
                fetchPolicy: 'network-only',
                variables: {
                    timeRange: {start: timeRange[0], end: timeRange[1]}
                }
            }
        ).pipe(map(data => data.data.getMeasuringCountsInDate.map((point: any) => {
            return {
                ...point, x: new Date(point.x), g: MeasureConnectionTypes[point.g]
            }
        })))
    }

    measuresCountsInDays(timeRange: TimeRange): Observable<GroupCTypeDayIntegerPoint[]> {
        return this.apollo.query<any>(
            {
                query: gql`
                    query getMeasuringCountsInDays($timeRange: ITimeRange){
                        getMeasuringCountsInDays(timeRange: $timeRange){
                            x
                            y
                            g
                        }
                    }
                `,
                fetchPolicy: 'network-only',
                variables: {
                    timeRange: {start: timeRange[0], end: timeRange[1]}
                }
            }
        ).pipe(map(data => data.data.getMeasuringCountsInDays.map((point: any) => {
            return {
                ...point, g: MeasureConnectionTypes[point.g]
            }
        })))
    }

    measuresCountsInHour(timeRange: TimeRange): Observable<GroupCTypeHourIntegerPoint[]> {
        return this.apollo.query<any>(
            {
                query: gql`
                    query getMeasuringCountsInHour($timeRange: ITimeRange){
                        getMeasuringCountsInHour(timeRange: $timeRange){
                            x
                            y
                            g
                        }
                    }
                `,
                fetchPolicy: 'network-only',
                variables: {
                    timeRange: {start: timeRange[0], end: timeRange[1]}
                }
            }
        ).pipe(map(data => data.data.getMeasuringCountsInHour.map((point: any) => {
            return {
                ...point, g: MeasureConnectionTypes[point.g]
            }
        })))
    }

    complaintsCountsInAddresses(timeRange: TimeRange): Observable<StringIntegerPoint[]> {
        return this.apollo.query<any>({
            query: gql`
                query getComplaintCountsInAddresses($timeRange: ITimeRange){
                    getComplaintCountsInAddresses(timeRange: $timeRange){
                        x
                        y
                    }
                }
            `,
            fetchPolicy: "network-only",
            variables: {timeRange: {start: timeRange[0], end: timeRange[1]}}
        }).pipe(map(data => data.data.getComplaintCountsInAddresses.map((point: any) => {
            return {...point, g: MeasureConnectionTypes[point.g]}
        })))
    }

    complaintsCountsInDate(timeRange: TimeRange): Observable<DateIntegerPoint[]> {
        return this.apollo.query<any>(
            {
                query: gql`
                    query getComplaintCountsInDate($timeRange: ITimeRange){
                        getComplaintCountsInDate(timeRange: $timeRange){
                            x
                            y
                        }
                    }
                `,
                fetchPolicy: 'network-only',
                variables: {
                    timeRange: {start: timeRange[0], end: timeRange[1]}
                }
            }
        ).pipe(map(data => data.data.getComplaintCountsInDate.map((point: any) => {
            return {
                ...point, x: new Date(point.x), g: MeasureConnectionTypes[point.g]
            }
        })))
    }

    complaintsCountsInDays(timeRange: TimeRange): Observable<DayIntegerPoint[]> {
        return this.apollo.query<any>(
            {
                query: gql`
                    query getComplaintCountsInDays($timeRange: ITimeRange){
                        getComplaintCountsInDays(timeRange: $timeRange){
                            x
                            y
                        }
                    }
                `,
                fetchPolicy: 'network-only',
                variables: {
                    timeRange: {start: timeRange[0], end: timeRange[1]}
                }
            }
        ).pipe(map(data => data.data.getComplaintCountsInDays.map((point: any) => {
            return {
                ...point, g: MeasureConnectionTypes[point.g]
            }
        })))
    }

    complaintsCountsInHour(timeRange: TimeRange): Observable<HourIntegerPoint[]> {
        return this.apollo.query<any>(
            {
                query: gql`
                    query getComplaintCountsInHour($timeRange: ITimeRange){
                        getComplaintCountsInHour(timeRange: $timeRange){
                            x
                            y
                        }
                    }
                `,
                fetchPolicy: 'network-only',
                variables: {
                    timeRange: {start: timeRange[0], end: timeRange[1]}
                }
            }
        ).pipe(map(data => data.data.getComplaintCountsInHour.map((point: any) => {
            return {
                ...point, g: MeasureConnectionTypes[point.g]
            }
        })))
    }

    measureCountsFromPeriod(timeRange: TimeRange): Observable<number> {
        return this.apollo.query<any>({
            query: gql`
                query getMeasuringCountsFromPeriod($timeRange:ITimeRange){
                    getMeasuringCountsFromPeriod(timeRange: $timeRange)
                }
            `,
            fetchPolicy: 'network-only',
            variables: {
                timeRange: {start: timeRange[0], end: timeRange[1]}
            }
        }).pipe(map(data => data.data.getMeasuringCountsFromPeriod))
    }

    complaintCountsFromPeriod(timeRange: TimeRange): Observable<number> {
        return this.apollo.query<any>({
            query: gql`
                query getComplaints($matchingObject: IComplaint, $dateFilter: ITimeRange, $limits: IPagination){
                    getComplaints(matchingObject: $matchingObject, dateFilter: $dateFilter, limits: $limits){
                        totalElements
                    }
                }
            `, fetchPolicy: 'network-only',
            variables: {
                matchingObject: {},
                dateFilter: {start: timeRange[0], end: timeRange[1]},
                limits: {offset: 0, limit: 1}
            }
        }).pipe(map(data => data.data.getComplaints.totalElements))
    }

    feedbackCounts(): Observable<number> {
        return this.apollo.query<any>({
            query: gql`
                query {
                    getTotalFeedbacks
                }
            `, fetchPolicy: "network-only"
        }).pipe(map(o => o.data.getTotalFeedbacks))
    }

    feedbackAllAvg(): Observable<number> {
        return this.apollo.query<any>({
            query: gql`
                query {
                    getAvgAllFeedbacks
                }
            `, fetchPolicy: "network-only"
        }).pipe(map(o => o.data.getAvgAllFeedbacks))
    }

    activeSessions(): Observable<ActiveSession[]> {
        return this.apollo.query<any>({
            query: gql`
                query {
                    getActiveSession {
                        id
                        deviceId
                        address
                        login
                        isMobile
                        hasInfo
                        isStarted
                    }
                }
            `, fetchPolicy: "network-only"
        }).pipe(map(data => data.data.getActiveSession))
    }

    updateActiveSessions(): Observable<UpdateProvider<ActiveSession>> {
        return this.apollo.subscribe<any>({
            query: gql`
                subscription {
                    updateActiveSession {
                        updateType
                        object {
                            id
                            deviceId
                            address
                            login
                            isMobile
                            hasInfo
                            isStarted
                        }
                    }
                }
            `
        }).pipe(map(data => data.data.updateActiveSession))
    }

    cpu(timeRange: TimeRange): Observable<CpuUtil[]> {
        return this.apollo.query<any>({
            query: gql`
                query getCpuStatistic($timeRange: ITimeRange){
                    getCpuStatistic(timeRange: $timeRange){
                        stamp
                        load
                    }
                }
            `,
            fetchPolicy: "network-only",
            variables: {
                timeRange: {start: timeRange[0], end: timeRange[1]}
            }
        }).pipe(map(data => data.data.getCpuStatistic))
    }

    ram(timeRange: TimeRange): Observable<RamUtil[]> {
        return this.apollo.query<any>({
            query: gql`
                query getRamStatistic($timeRange: ITimeRange){
                    getRamStatistic(timeRange: $timeRange){
                        stamp
                        utilized
                        total
                    }
                }
            `,
            fetchPolicy: "network-only",
            variables: {
                timeRange: {start: timeRange[0], end: timeRange[1]}
            }
        }).pipe(map(data => data.data.getRamStatistic))
    }

    network(timeRange: TimeRange): Observable<NetworkUtil[]> {
        return this.apollo.query<any>({
            query: gql`
                query getNetworkStatistic($timeRange: ITimeRange) {
                    getNetworkStatistic(timeRange: $timeRange) {
                        stamp
                        rx
                        tx
                    }
                }
            `,
            fetchPolicy: "network-only",
            variables: {
                timeRange: {start: timeRange[0], end: timeRange[1]}
            }
        }).pipe(map(data => data.data.getNetworkStatistic))
    }

    feedbackAvgInAddresses(timeRange: TimeRange): Observable<StringDoublePoint[]> {
        return this.apollo.query<any>({
            query: gql`
                query getFeedbackAvgInAddresses($timeRange: ITimeRange){
                    getFeedbackAvgInAddresses(timeRange: $timeRange){
                        x
                        y
                    }
                }
            `,
            fetchPolicy: "network-only",
            variables: {timeRange: {start: timeRange[0], end: timeRange[1]}}
        }).pipe(map(data => data.data.getFeedbackAvgInAddresses));
    }
}
