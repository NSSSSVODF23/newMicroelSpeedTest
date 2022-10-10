import {Component, OnInit} from "@angular/core";
import {User} from "src/app/common/transport/models/user";
import {AuthService} from "../../service/auth.service";
import {UserService} from "../../service/user.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {IsActiveMatchOptions} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RoleGroup} from "../../../common/transport/models/role";

@Component({
    selector: "app-admin-top-panel",
    templateUrl: "./admin-top-panel.component.html",
    styleUrls: ["./admin-top-panel.component.scss"],
})
export class AdminTopPanelComponent implements OnInit {

    isMobile = false;
    matchOpt: IsActiveMatchOptions = {
        queryParams: "ignored",
        paths: "exact",
        fragment: "exact",
        matrixParams: "exact"
    }
    menuVisible = false;

    constructor(readonly breakpoint: BreakpointObserver, readonly authService: AuthService) {
    }

    ngOnInit(): void {
        this.breakpoint.observe('(max-width:990px)').subscribe(v => this.isMobile = v.matches)
    }

    openMenu() {
        this.menuVisible = true;
    }

    closeMenu() {
        this.menuVisible = false;
    }
}
