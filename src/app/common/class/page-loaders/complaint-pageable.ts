import {FilterChipsValue, FilterRequestParams, Pageable} from "../../interfaces/pageing/pageable";
import {Complaint} from "../../transport/models/complaint";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {UpdateProvider} from "../../transport/models/update-provider";
import {Page} from "../../transport/models/page";
import {QueryLimit} from "../../transport/models/query-limit";
import {Calendar, ExtendDate} from "../../method/time";
import {ComplaintService} from "../../../admin/service/complaint.service";
import {ListMutationTypes} from "../../transport/enums/list-mutation-types";
import {HouseService} from "../../../admin/service/house.service";
import {Title} from "@angular/platform-browser";

export class ComplaintPageable implements Pageable<Complaint> {

    constructor(readonly complaintService: ComplaintService, readonly houseService: HouseService) {
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
        if (params['phone']) chipsValues.push(
            {
                name: "Телефон", value: params['phone'], remove: () => removeFilter('phone')
            }
        )
        if (params['processed']) chipsValues.push(
            {
                name: "Статус",
                value: params['processed'] === 'true' ? "Обработанные" : "Необработанные",
                remove: () => removeFilter('processed')
            }
        )

        return chipsValues
    }

    queryToInputModels(params: Params): { [p: string]: any } {
        const created = params['created'] ? JSON.parse(params['created']) : undefined;
        return {
            created: created ? [new Date(created[0]), new Date(created[1])] : undefined,
            ip: params['ip'],
            login: params['login'],
            phone: params['phone'],
            address: params['address'] ? parseInt(params['address']) : undefined,
            mac: params['mac'],
            processed: params['processed'] === 'true' ? true : params['processed'] === 'false' ? false : undefined,
            offset: parseInt(params['offset']),
            limit: parseInt(params['limit'])
        }
    }

    liveUpdateProvides(): Observable<UpdateProvider<Complaint>>[] {
        return [this.complaintService.updateComplaints()];
    }

    queryToMatchingObject(params: Params): FilterRequestParams<Complaint> {
        return {
            matchingObject: {
                phone: params['phone'],
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
            extras: {
                dateFilter: Calendar.formattedTimeRange(params['created']),
                isProcessed: params['processed'] === 'true' ? true : params['processed'] === 'false' ? false : undefined
            }
        };
    }

    loader(filter: FilterRequestParams<Complaint>): Observable<Page<Complaint>> {
        return this.complaintService.getComplaints(filter);
    }

    preventUpdate(provider: UpdateProvider<Complaint>, filter: { [p: string]: string | undefined }): (() => boolean)[] {
        return [
            () => {
                if (provider.updateType === ListMutationTypes.ADD) {
                    const isProcessed = !!provider.object?.processed;
                    if (filter['phone'] && !provider.object?.phone?.includes(filter['phone'])) return true;
                    if (filter['login'] && !provider.object?.session?.login?.includes(filter['login'])) return true;
                    if (filter['address'] && provider.object?.session?.house?.houseId !== parseInt(filter['address'])) return true;
                    if (filter['ip'] && !provider.object?.session?.ip?.includes(filter['ip'])) return true;
                    if (filter['mac'] && !provider.object?.session?.mac?.includes(filter['mac'])) return true;
                    if (filter['created']) {
                        const dateRange: Date[] = JSON.parse(filter['created']);
                        const created = new Date(provider.object?.created ?? 0).getTime();
                        if (dateRange[0].getTime() > created || dateRange[1].getTime() < created) return true;
                    }
                    if (filter['processed'] !== undefined && !!filter['processed'] === isProcessed) return true;
                }
                return false;
            }
        ];
    }

    inputModelToQueryParamHandlers(): { [p: string]: (value: any) => (string | undefined) } {
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
            phone: value => value,
            mac: value => value,
            offset: value => JSON.stringify(value),
            limit: value => JSON.stringify(value),
            processed: value => value
        };
    }

    liveUpdateIdentificationFields(): string[] {
        return ["complaintId"];
    }
}
