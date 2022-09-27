import {animate, style, transition, trigger} from "@angular/animations";
import {
    Component,
    Input,
    OnInit,
    AfterViewInit,
    SecurityContext,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {DomSanitizer} from "@angular/platform-browser";
import {url} from "inspector";
import {DOC_ORIENTATION, NgxImageCompressService} from "ngx-image-compress";
import {map} from "rxjs";
import {User} from "../../../common/transport/models/user";

const fadeAnimation = trigger("fade", [
    transition(":enter", [
        style({
            opacity: 0,
        }),
        animate(
            "200ms ease-in-out",
            style({
                opacity: 1,
            }),
        ),
    ]),
    transition(":leave", [
        style({
            opacity: 1,
        }),
        animate(
            "200ms ease-in-out",
            style({
                opacity: 0,
            }),
        ),
    ]),
]);

@Component({
    selector: "app-user-avatar",
    templateUrl: "./user-avatar.component.html",
    styleUrls: ["./user-avatar.component.scss"],
    animations: [fadeAnimation],
})
export class UserAvatarComponent implements OnInit, AfterViewInit {
    image: any;
    letter: string = "";
    imageStyle: any;
    @Input() size: "large" | "xlarge" | "small" = "large";
    @Input() shape: "square" | "circle" = "circle";
    @Input() editable = false;
    editAvatarShow = false;
    @Input() formGroup?: FormGroup;
    @Output() userChange = new EventEmitter<User>();

    constructor(
        readonly sanitizer: DomSanitizer,
        readonly imageCompress: NgxImageCompressService,
    ) {
    }

    private _user?: User;

    @Input() set user(user: User | undefined) {
        this._user = user;
        if (user === undefined) return;
        this.setAvatar();
        this.setLetter();
    }

    ngOnInit(): void {
        this.formGroup?.valueChanges.subscribe((user: User) => {
            if (this._user) {
                this._user.name = user.name;
                this._user.avatar = user.avatar;
            } else {
                this._user = {name: user.name, avatar: user.avatar};
            }
            this.setAvatar();
            this.setLetter();
        });
    }

    ngAfterViewInit(): void {
    }

    openFileSelector() {
        if (this.editable)
            this.imageCompress.uploadFile().then(({image, orientation}) => {
                this.imageCompress
                    .compressFile(
                        image,
                        DOC_ORIENTATION.Default,
                        undefined,
                        undefined,
                        128,
                        128,
                    )
                    .then((image) => {
                        fetch(image)
                            .then((res) => res.arrayBuffer())
                            .then((buffer) => {
                                if (this._user) {
                                    this._user.avatar = buffer;
                                } else {
                                    this._user = {avatar: buffer};
                                }
                                this.setAvatar();
                                this.userChange.emit(this._user);
                                this.formGroup?.patchValue({
                                    avatar: [...new Uint8Array(buffer)],
                                });
                            });
                    });
            });
    }

    private setAvatar() {
        if (this._user?.avatar) {
            const blob = new Blob([new Uint8Array(this._user.avatar)], {
                type: "image/*",
            });
            this.imageStyle = this.sanitizer.bypassSecurityTrustUrl(
                `url('${URL.createObjectURL(blob)}'`,
            );
            this.letter = "";
        }
    }

    private setLetter() {
        if (!this._user?.avatar && this._user?.name) {
            this.imageStyle = "";
            const secondLetterMatch = this._user?.name.match(/ ([А-Я])/);
            console.log(secondLetterMatch);
            if (secondLetterMatch) {
                this.letter = this._user?.name[0] + secondLetterMatch[1];
            } else {
                this.letter = this._user?.name[0];
            }
        }
    }
}
