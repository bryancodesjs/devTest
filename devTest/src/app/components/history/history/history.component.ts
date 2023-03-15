import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { Record } from 'src/app/models/record';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  results: any[] = [];
  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.firebase.getAll().snapshotChanges().subscribe(data => {
      this.results = [];
      data.forEach(item => {
        let a = item.payload.toJSON();
        console.log(a);
        this.results.push(a);
      })
    })
  }
}
