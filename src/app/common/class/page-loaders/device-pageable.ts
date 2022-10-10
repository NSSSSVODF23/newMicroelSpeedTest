import {FilterChipsValue, FilterRequestParams, Pageable} from "../../interfaces/pageing/pageable";
import {Device} from "../../service/device-info.service";
import {Observable} from "rxjs";
import {Page} from "../../transport/models/page";
import {DeviceService} from "../../../admin/service/device.service";
import {Params} from "@angular/router";
import {QueryLimit} from "../../transport/models/query-limit";
import {UpdateProvider} from "../../transport/models/update-provider";
import {ListMutationTypes} from "../../transport/enums/list-mutation-types";
import {ExtendDate} from "../../method/time";
import {HouseService} from "../../../admin/service/house.service";

export class DevicePageable implements Pageable<Device> {

    constructor(readonly deviceService: DeviceService, readonly houseService: HouseService) {
    }

    queryToChips(params: Params, removeFilter: (name: string) => void): FilterChipsValue[] {
        const chipsValues = [];
        if (params['deviceId']) {
            chipsValues.push({name: "ID", value: params['deviceId'], remove: () => removeFilter('deviceId')})
        }
        if (params['login']) {
            chipsValues.push({name: "Логин", value: params['login'], remove: () => removeFilter('login')})
        }
        if (params['address']) {
            chipsValues.push({
                name: "Адрес",
                value: this.houseService.houses.find(h => h.houseId === parseInt(params['address']))?.address,
                remove: () => removeFilter('address')
            })
        }
        if (params['ip']) {
            chipsValues.push({name: "IP Адрес", value: params['ip'], remove: () => removeFilter('ip')})
        }
        if (params['hostname']) {
            chipsValues.push({name: "Имя хоста", value: params['hostname'], remove: () => removeFilter('hostname')})
        }
        return chipsValues;
    }

    queryToInputModels(params: Params): { [key: string]: any; } {
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

    loader(filter: FilterRequestParams<Device>): Observable<Page<Device>> {
        return this.deviceService.get(filter)
    }

    queryToMatchingObject(params: Params): FilterRequestParams<Device> {
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

    inputModelToQueryParamHandlers(): { [p: string]: (value: any) => string } {
        return {
            deviceId: value => value,
            login: value => value,
            address: value => JSON.stringify(value),
            ip: value => value,
            hostname: value => value
        };
    }

    liveUpdateProvides(): Observable<UpdateProvider<Device>>[] {
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

    liveUpdateIdentificationFields(): string[] {
        return ['deviceId'];
    }
}
