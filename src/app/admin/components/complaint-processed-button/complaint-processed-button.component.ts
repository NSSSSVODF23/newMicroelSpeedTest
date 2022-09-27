import {Component, Input, OnInit} from '@angular/core';
import {ComplaintService} from "../../service/complaint.service";
import {Complaint} from "../../../common/transport/models/complaint";

@Component({
    selector: 'app-complaint-processed-button',
    templateUrl: './complaint-processed-button.component.html',
    styleUrls: ['./complaint-processed-button.component.scss']
})
export class ComplaintProcessedButtonComponent implements OnInit {

    @Input() complaint?: Complaint;
    loading = false;

    constructor(readonly complaintService: ComplaintService) {
    }

    ngOnInit(): void {
    }

    processedComplaint(event: any, complaint?: Complaint) {
        event.stopPropagation();
        if (complaint?.processed) return;
        this.loading = true;
        if (complaint?.complaintId) this.complaintService.doProcessed(complaint.complaintId).subscribe(data => this.loading = false);
    }

}
