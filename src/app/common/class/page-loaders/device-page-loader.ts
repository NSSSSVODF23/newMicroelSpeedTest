import {FilterRequestParams, Pageable} from "../../interfaces/pageable";
import {Device} from "../../service/device-info.service";
import {Observable} from "rxjs";
import {Page} from "../../transport/models/page";
import {DeviceService} from "../../../admin/service/device.service";
import {Params} from "@angular/router";
import {QueryLimit} from "../../transport/models/query-limit";
import {UpdateProvider} from "../../transport/models/update-provider";
import {ListMutationTypes} from "../../transport/enums/list-mutation-types";
import {ExtendDate} from "../../method/time";

export class DevicePageLoader implements Pageable<Device> {

    constructor(readonly deviceService: DeviceService) {
    }

    inputValues(params: Params): { [key: string]: any; } {
        return {
            deviceId: params['deviceId'],
            login: params['login'],
            address: params['address'] ? parseInt(params['address']) : undefined,
            ip: params['ip'],
            hostname: params['hostname'],
            offset: parseInt(params['offset']),
            limit: parseInt(params['limit'])
        }
    }

    pageLoader(filter: FilterRequestParams<Device>): Observable<Page<Device>> {
        return this.deviceService.get(filter)
    }

    matchingObject(params: Params): FilterRequestParams<Device> {
        return {
            matchingObject: {
                deviceId: params['deviceId'],
                lastSession: {
                    login: params['login'],
                    house: {
                        houseId: params['address']
                    }
                },
                ip: params['ip'],
                hostname: params['hostname']
            },
            limits: QueryLimit.of(params['offset'], params['limit'])
        }
    }

    updateHandlers(): { [p: string]: (value: any) => string } {
        return {
            deviceId: value => value,
            login: value => value,
            address: value => JSON.stringify(value),
            ip: value => value,
            hostname: value => value
        };
    }

    listUpdaters(): Observable<UpdateProvider<Device>>[] {
        return [this.deviceService.update()];
    }

    preventUpdate(provider: UpdateProvider<Device>, filter: { [p: string]: string | undefined }): (() => boolean)[] {
        return [
            () => {
                if (provider.updateType === ListMutationTypes.ADD) {
                    if (filter['offset'] && parseInt(filter['offset']) > 0) return true;
                    if (filter['deviceId'] && !provider.object?.deviceId?.includes(filter['deviceId'])) return true;
                    if (filter['hostname'] && !provider.object?.hostname?.includes(filter['hostname'])) return true;
                    if (filter['login'] && !provider.object?.lastSession?.login?.includes(filter['login'])) return true;
                    if (filter['ip'] && !provider.object?.lastSession?.ip?.includes(filter['ip'])) return true;
                    if (filter['address'] && provider.object?.lastSession?.house?.houseId !== parseInt(filter['address'])) return true;
                }
                return false;
            }
        ];
    }

    updateIds(): string[] {
        return ['deviceId'];
    }
}