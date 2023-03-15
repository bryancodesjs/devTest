import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { Record } from 'src/app/models/record';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  page:number = 1;
  results: any[] = [];
  pageIsLoading = true;
  lastFilterUsed: string = '';

  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.firebase.getAll().snapshotChanges().subscribe(data => {
      this.results = [];
      data.forEach(item => {
        let a = item.payload.toJSON();
        // console.log(a);
        this.results.push(a);
      })
      this.pageIsLoading = false;
    })
  }

  sortData(sortBy:string) {

    if(this.lastFilterUsed == sortBy) {
      this.results.reverse();
      this.lastFilterUsed = '';
      return;
    }
    if(sortBy == 'date') {
      this.results.sort((a, b) => {
        return this.lastFilterUsed == sortBy ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      })
    } else if(sortBy == 'price') {
      this.results.sort((a, b) => {
        return this.lastFilterUsed == sortBy ? b.price - a.price : a.price - b.price;
      })
    } else if(sortBy == 'size') {
      this.results.sort((a, b) => {
        return this.lastFilterUsed == sortBy ? b.size - a.size : a.size - b.size;
      })
    } else if (sortBy == 'side') {
      this.results.sort((a:any,b:any) => {
        if(a.side < b.side) {
          return -1;
        } else if (a.side > b.side) {
          return 1;
        } else {
          return 0
        }
      })
    }
    this.lastFilterUsed = sortBy;
  }
}
