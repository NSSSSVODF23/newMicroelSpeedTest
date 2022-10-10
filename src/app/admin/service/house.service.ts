import {Injectable} from '@angular/core';
import {ApolloQueryResult} from '@apollo/client/core';
import {Apollo, gql} from 'apollo-angular';
import {map, Observable} from 'rxjs';
import {House} from 'src/app/common/transport/models/house';

interface GetAllHouses {
  getAllHouses: House[];
}

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  houses: House[] = [];

  constructor(readonly apollo: Apollo) {
    this.getAllHouses().subscribe(houses => this.houses = houses)
  }

  public getAllHouses(): Observable<House[]> {
    return this.apollo.query<any>({
      query: gql`
        {
          getAllHouses {
            houseId
            address
          }
        }
      `,
    }).pipe(map(o => [...o.data.getAllHouses]));
  }
}
