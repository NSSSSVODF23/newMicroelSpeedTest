import {Injectable} from '@angular/core';
import {ApolloQueryResult} from '@apollo/client/core';
import {Apollo, gql} from 'apollo-angular';
import {Observable} from 'rxjs';
import {House} from 'src/app/common/transport/models/house';

interface GetAllHouses {
  getAllHouses: House[];
}

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  constructor(readonly apollo: Apollo) { }

  public getAllHouses(): Observable<ApolloQueryResult<GetAllHouses>> {
    return this.apollo.query<GetAllHouses>({
      query: gql`
        {
          getAllHouses {
            houseId
            address
          }
        }
      `,
    });
  }
}
