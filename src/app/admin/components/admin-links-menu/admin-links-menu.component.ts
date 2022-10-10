import {Component, OnInit} from '@angular/core';
import {IsActiveMatchOptions} from '@angular/router';
import {AuthService} from "../../service/auth.service";

@Component({
    selector: 'app-admin-links-menu',
    templateUrl: './admin-links-menu.component.html',
    styleUrls: ['./admin-links-menu.component.scss']
})
export class AdminLinksMenuComponent implements OnInit {

    matchOpt: IsActiveMatchOptions = {
        queryParams: "ignored",
        paths: "exact",
        fragment: "exact",
        matrixParams: "ignored"
    }

    constructor(readonly authService: AuthService) {
    }

    ngOnInit(): void {
    }

}
