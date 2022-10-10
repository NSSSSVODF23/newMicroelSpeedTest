import {FilterChipsValue, FilterRequestParams, Pageable} from "../../interfaces/pageing/pageable";
import {Measure} from "../../transport/models/measure";
import {Params} from "@angular/router";
import {forkJoin, map, Observable} from "rxjs";
import {Page} from "../../transport/models/page";
import {QueryLimit} from "../../transport/models/query-limit";
import {Calendar, ExtendDate} from "../../method/time";
import {MeasureService} from "../../../admin/service/measure.service";
import {UpdateProvider} from "../../transport/models/update-provider";
import {ListMutationTypes} from "../../transport/enums/list-mutation-types";
import {HouseService} from "../../../admin/service/house.service";

export class MeasurePageable implements Pageable<Measure> {

    constructor(readonly measures: MeasureService, readonly houseService: HouseService) {
    }

    queryToChips(params: Params, removeFilter: (name: string) => void): FilterChipsValue[] {
        const chipsValues = [];
        const created = params['created'] ? JSON.parse(params['created']) : undefined;
        if (params['created']) {
            const deltaTime = Math.ceil((new Date(created[1]).getTime() - new Date(created[0]).getTime()) / (24 * 60 * 60 * 1000)).toString()
            chipsValues.push(
                {
                    name: "Дата создания", value: deltaTime + " д.", remove: () => removeFilter('created')
                }
            )
        }
        if (params['ip']) chipsValues.push(
            {
                name: "IP Адрес", value: params['ip'], remove: () => removeFilter('ip')
            }
        )
        if (params['login']) chipsValues.push(
            {
                name: "Логин", value: params['login'], remove: () => removeFilter('login')
            }
        )
        if (params['address']) chipsValues.push(
            {
                name: "Адрес",
                value: this.houseService.houses.find(h => h.houseId === parseInt(params['address']))?.address,
                remove: () => removeFilter('address')
            }
        )
        if (params['mac']) chipsValues.push(
            {
                name: "Мак", value: params['mac'], remove: () => removeFilter('mac')
            }
        )

        return chipsValues
    }

    queryToInputModels(params: Params): { [key: string]: any; } {
        const created = params['created'] ? JSON.parse(params['created']) : undefined;
        return {
            created: created ? [new Date(created[0]), new Date(created[1])] : undefined,
            ip: params['ip'],
            login: params['login'],
            address: params['address'] ? parseInt(params['address']) : undefined,
            mac: params['mac'],
            offset: parseInt(params['offset']),
            limit: parseInt(params['limit'])
        }
    }

    queryToMatchingObject(params: Params): FilterRequestParams<Measure> {
        return {
            matchingObject: {
                session: {
                    ip: params['ip'],
                    login: params['login'],
                    mac: params['mac'],
                    house: {
                        houseId: params['address']
                    }
                }
            },
            limits: QueryLimit.of(params['offset'], params['limit']),
            extras: Calendar.formattedTimeRange(params['created'])
        }
    }

    loader(filter: FilterRequestParams<Measure>): Observable<Page<Measure>> {
        return forkJoin({done: this.measures.get(filter), begin: this.measures.getBeginning()}).pipe(map(obj => {
            const copy = {...obj.done}
            copy.content = [...obj.begin, ...obj.done.content]
            return copy;
        }))
    }

    liveUpdateProvides(): Observable<UpdateProvider<Measure>>[] {
        return [
            this.measures.update(),
            this.measures.updateBeginning()
        ];
    }

    preventUpdate(provider: UpdateProvider<Measure>, filter: { [key: string]: string | undefined }): (() => boolean)[] {
        return [
            () => {
                if (provider.updateType === ListMutationTypes.ADD) {
                    if (filter['offset'] && parseInt(filter['offset']) > 0) return true;
                    if (filter['ip'] && !provider.object?.session?.ip?.includes(filter['ip'])) return true;
                    if (filter['login'] && !provider.object?.session?.login?.includes(filter['login'])) return true;
                    if (filter['address'] && parseInt(filter['address']) !== provider.object?.session?.house?.houseId) return true;
                    if (filter['mac'] && !provider.object?.session?.mac?.includes(filter['mac'])) return true;
                    if (filter['created']) {
                        const dateRange: Date[] = JSON.parse(filter['created']);
                        const created = new Date(provider.object?.created ?? 0).getTime();
                        if (dateRange[0].getTime() > created || dateRange[1].getTime() < created) return true;
                    }
                }
                return false;
            },
            () => false
        ];
    }

    liveUpdateIdentificationFields() {
        return ["measureId", "beginningId"]
    }

    inputModelToQueryParamHandlers(): { [p: string]: (value: any) => string | undefined } {
        return {
            created: (value: Date[]) => {
                if (value && value[0] && value[1]) {
                    return JSON.stringify([ExtendDate.of(value[0]).getStartDay().getFormatted(), ExtendDate.of(value[1]).getEndDay().getFormatted()])
                } else {
                    return undefined
                }
            },
            ip: value => value,
            login: value => value,
            address: value => JSON.stringify(value),
            mac: value => value,
            offset: value => JSON.stringify(value),
            limit: value => JSON.stringify(value)
        };
    }
}
