import { NgModule } from "@angular/core";
import { ApolloModule, APOLLO_OPTIONS } from "apollo-angular";
import {
	ApolloClientOptions,
	InMemoryCache,
	ApolloLink,
	split,
} from "@apollo/client/core";
import { HttpLink } from "apollo-angular/http";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const uri = `http://${location.hostname}:8080/graphql`; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
	const basic = setContext((operation, context) => ({
		headers: {
			Accept: "charset=utf-8",
		},
	}));

	const auth = setContext((operation, context) => ({
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	}));
	// Create a WebSocket link:
	const ws = new SubscriptionClient(
		`ws://${location.hostname}:8080/subscriptions`,
		{
			reconnect: true,
			connectionParams: async () => {
				return {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				};
			},
		},
	);

	// using the ability to split links, you can send data to each link
	// depending on what kind of operation is being sent
	const link = split(
		// split based on operation type
		({ query }) => {
			const def = getMainDefinition(query);
			return (
				def.kind === "OperationDefinition" && def.operation === "subscription"
			);
		},
		new WebSocketLink(ws),
		ApolloLink.from([basic, auth, httpLink.create({ uri })]),
	);

	const cache = new InMemoryCache();

	return {
		link,
		cache,
	};
}

@NgModule({
	exports: [ApolloModule],
	providers: [
		{
			provide: APOLLO_OPTIONS,
			useFactory: createApollo,
			deps: [HttpLink],
		},
	],
})
export class GraphQLModule {}
