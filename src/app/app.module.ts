import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { LayoutModule } from "@angular/cdk/layout";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ResultPageComponent } from "./public/pages/result-page/result-page.component";
import { GraphQLModule } from "./graphql.module";
import { HttpClientModule } from "@angular/common/http";
import { CommonComponentModule } from "./common/common-component.module";
import { CardModule } from "primeng/card";
import { SigninPageComponent } from "./admin/pages/signin-page/signin-page.component";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
	declarations: [AppComponent, SigninPageComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		GraphQLModule,
		HttpClientModule,
		LayoutModule,
		CardModule,
		InputTextModule,
		PasswordModule,
		ButtonModule,
		ReactiveFormsModule,
		ToastModule,
	],
	exports: [BrowserAnimationsModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
