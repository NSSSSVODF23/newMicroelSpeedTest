import {Component, OnDestroy, OnInit} from '@angular/core';
import {User} from "../../../common/transport/models/user";
import {AuthService} from "../../service/auth.service";
import {UserService} from "../../service/user.service";
import {RoleGroup} from "../../../common/transport/models/role";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ListMutationTypes} from "../../../common/transport/enums/list-mutation-types";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-user-panel',
    templateUrl: './account-panel.component.html',
    styleUrls: ['./account-panel.component.scss']
})
export class AccountPanelComponent implements OnInit, OnDestroy {
    currentUser?: User;
    showEditDialog = false;
    roleOptions: RoleGroup[] = [];

    editFormGroup = new FormGroup({
        name: new FormControl("", Validators.required),
        password: new FormControl("", [
            Validators.required,
            Validators.minLength(6),
        ]),
        role: new FormControl(2, Validators.required),
        avatar: new FormControl(undefined),
        userId: new FormControl(undefined),
        username: new FormControl(undefined),
    });
    errorMessages = {
        loginAlreadyExist: "Данный логин уже существует",
        required: "Заполните поле",
        minlength: "Минимальная длина 6 символов",
    };
    subscription: Subscription[] = [];

    constructor(readonly auth: AuthService, readonly userService: UserService) {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(s => s.unsubscribe())
    }

    ngOnInit(): void {
        const username = this.auth.getUsername();
        if (username)
            this.userService.getUserByUsername(username).subscribe((data) => {
                this.currentUser = data;
                this.editFormGroup.patchValue({
                    name: data.name,
                    password: data.password,
                    role: data.role?.roleId,
                    avatar: data.avatar,
                    userId: data.userId,
                    username: data.username
                })
            });
        this.userService.getAllRoles().subscribe((data) => (this.roleOptions = data));
        this.subscription.push(
            this.userService.updateUsers().subscribe(update => {
                if (update.updateType === ListMutationTypes.UPDATE && update.object?.username === this.currentUser?.username) {
                    this.currentUser = {...this.currentUser, ...update.object}
                }
            })
        )
    }

    getNameLabel(value: String) {
        return value === "" ? "Имя пользователя" : value;
    }

    getRoleLabel(roleId: number) {
        return this.roleOptions.find((role) => role.roleId === roleId)?.description;
    }

    openEditDialog() {
        this.showEditDialog = true;
    }

    editUser() {
        const roleId = this.editFormGroup.getRawValue().role;
        const tempUser: User = this.editFormGroup.getRawValue();
        tempUser.role = {roleId};
        this.userService.editUser(tempUser).subscribe({
            next: (s) =>
                console.log(`Пользователь ${tempUser.name}, отредактирован.`),
            error: (e) =>
                console.log("Ошибка редактирования пользователя"),
        });
    }
}
