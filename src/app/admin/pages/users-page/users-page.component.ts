import {
    animate,
    animation,
    state,
    style,
    transition,
    trigger,
} from "@angular/animations";
import {Component, OnDestroy, OnInit} from "@angular/core";
import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {MutationResult} from "apollo-angular";
import {ConfirmationService, MessageService} from "primeng/api";
import {
    debounceTime,
    distinctUntilChanged,
    map,
    Observable,
    switchMap,
    first,
    catchError, Subscription,
} from "rxjs";
import {ListMutationTypes} from "src/app/common/transport/enums/list-mutation-types";
import {RoleGroup} from "src/app/common/transport/models/role";
import {UpdateProvider} from "src/app/common/transport/models/update-provider";
import {User} from "src/app/common/transport/models/user";
import {UserService} from "../../service/user.service";
import {updateListResolver} from "../../../common/method/update_resolver";

@Component({
    templateUrl: "./users-page.component.html",
    styleUrls: ["./users-page.component.scss"],
})
export class UsersPageComponent implements OnInit, OnDestroy {
    users: User[] = Array.from({length: 10000});
    roleOptions: RoleGroup[] = [];
    showCreateDialog = false;
    showEditDialog = false;
    createFormGroup = new FormGroup({
        name: new FormControl("", Validators.required),
        username: new FormControl(
            "",
            Validators.required,
            this.asyncValidateLogin(),
        ),
        password: new FormControl("", [
            Validators.required,
            Validators.minLength(8),
        ]),
        role: new FormControl(1, Validators.required),
    });
    editFormGroup = new FormGroup({
        name: new FormControl("", Validators.required),
        password: new FormControl("", [
            Validators.required,
            Validators.minLength(8),
        ]),
        role: new FormControl(1, Validators.required),
        avatar: new FormControl(undefined),
        userId: new FormControl(undefined),
        username: new FormControl(undefined),
    });
    errorMessages = {
        loginAlreadyExist: "Данный логин уже существует",
        required: "Заполните поле",
        minlength: "Минимальная длина 8 символов",
    };
    private subscription: Subscription[] = [];

    constructor(
        readonly user: UserService,
        readonly messageService: MessageService,
        readonly confirmation: ConfirmationService,
    ) {
    }

    ngOnDestroy(): void {
        this.subscription.forEach(sub => sub.unsubscribe())
        this.subscription = [];
    }

    ngOnInit(): void {
        this.user.getAllUsers().subscribe((data) => {
            this.users = data;
        });
        this.user.getAllRoles().subscribe((data) => (this.roleOptions = data));
        this.subscription.push(
            this.user.updateUsers().subscribe((data) => {
                this.users = updateListResolver(this.users, 'userId', data);
            })
        )
    }

    getAvatarLabel(value: String) {
        const secondLetterMatch = value.match(/ ([А-я])/);
        if (secondLetterMatch) {
            return value[0] + secondLetterMatch[1];
        }
        return value[0];
    }

    getNameLabel(value: String) {
        return value === "" ? "Имя пользователя" : value;
    }

    getRoleLabel(roleId: number) {
        return this.roleOptions.find((role) => role.roleId === roleId)?.description;
    }

    openCreateDialog() {
        this.showCreateDialog = true;
        this.createFormGroup.reset({
            name: "",
            username: "",
            password: "",
            role: 1,
        });
    }

    createUser() {
        const roleId = this.createFormGroup.getRawValue().role;
        const tempUser: User = this.createFormGroup.getRawValue();
        tempUser.role = {
            roleId,
            description: this.roleOptions.find((group) => group.roleId === roleId)
                ?.description,
        };
        this.user.createUser(tempUser).subscribe({
            next: (s) =>
                this.messageService.add({
                    severity: "success",
                    summary: `Пользователь ${tempUser.name}, добавлен.`,
                }),
            error: (e) =>
                this.messageService.add({
                    severity: "error",
                    summary: "Ошибка создания пользователя",
                    detail: e,
                }),
        });
    }

    editUser() {
        const roleId = this.editFormGroup.getRawValue().role;
        const tempUser: User = this.editFormGroup.getRawValue();
        tempUser.role = {roleId};
        this.user.editUser(tempUser).subscribe({
            next: (s) =>
                this.messageService.add({
                    severity: "success",
                    summary: `Пользователь ${tempUser.name}, отредактирован.`,
                }),
            error: (e) =>
                this.messageService.add({
                    severity: "error",
                    summary: "Ошибка редактирования пользователя",
                    detail: e,
                }),
        });
    }

    deleteUser(userId: number) {
        this.confirmation.confirm({
            header: "Удаление",
            message: `Удалить пользователя #${userId}?`,
            accept: () => {
                this.user.deleteUser(userId).subscribe({
                    next: (s) =>
                        this.messageService.add({
                            severity: "success",
                            summary: `Пользователь #${userId}, удален.`,
                        }),
                    error: (e) =>
                        this.messageService.add({
                            severity: "error",
                            summary: "Ошибка удаления пользователя",
                            detail: e,
                        }),
                });
            },
        });
    }

    editUserOpen(user: User) {
        this.editFormGroup.reset({
            avatar: user.avatar,
            name: user.name,
            password: user.password,
            role: user.role?.roleId,
            userId: user.userId,
            username: user.username,
        });
        this.showEditDialog = true;
    }

    private asyncValidateLogin(): AsyncValidatorFn {
        return (control) =>
            control.valueChanges.pipe(
                debounceTime(1000),
                distinctUntilChanged(),
                switchMap((value) => this.user.validateLogin(value)),
                map((result) => (result ? {loginAlreadyExist: true} : null)),
                first(),
            );
    }
}
