import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Measure} from "../../common/transport/models/measure";
import {catchError, map, Observable, of} from "rxjs";
import {PublicApiResponse} from "../../common/transport/models/public-api-response";
import {CreateComplaintBody} from "../../common/transport/models/complaint";
import {DeviceInfoService} from "../../common/service/device-info.service";
import {Page} from "../../common/transport/models/page";


@Injectable({
    providedIn: 'root'
})
export class PublicApiService {

    public CAPTCHA_PUBLIC = "6LeEWkIiAAAAALQeUOIoO9gEPMMeOGIZZdYk2kuR"

    constructor(readonly http: HttpClient, readonly deviceInfoService: DeviceInfoService) {
    }

    public getMeasure(id: number): Observable<PublicApiResponse<Measure>> {
        return this.http.post(
            this.url("measure"),
            {id},
        )
    }

    public oldMeasurements(): Observable<PublicApiResponse<Page<Measure>>> {
        return this.http.post(this.url("old-measures"), {});
    }

    public putRating(rating: number): Observable<PublicApiResponse<any>> {
        return this.http.put(this.url("rating"), {rating})
    }

    public putComplaint(complaintBody: CreateComplaintBody): Observable<PublicApiResponse<any>> {
        return this.http.put(this.url("complaint"), complaintBody)
    }

    public isAlreadyRated(): Observable<PublicApiResponse<any>> {
        return this.http.post(this.url("has-rated"), {});
    }

    public isPro() {
        return this.http.post<PublicApiResponse<boolean>>(
            this.url("is-pro"), {deviceId: this.deviceInfoService.deviceId})
            .pipe(map(response => response.isError ? false : response.responseBody ?? false), catchError(e => of(false)))
    }

    public isAlreadyRunning(): Observable<PublicApiResponse<any>> {
        return this.http.post<PublicApiResponse<any>>(this.url('already-run'), {});
    }

    private url(func: string) {
        return `http://${location.hostname}:${location.port}/public/${func}`
    }


}
