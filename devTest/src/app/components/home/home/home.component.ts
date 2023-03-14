import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  socket = new WebSocketSubject('wss://ws.bitmex.com/realtime?subscribe=instrument,orderBookL2_25:XBTUSD');

  sellSide: any[] = [];
  buySide: any[] = [];
  averagePrice: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.initWorker();
    // setTimeout(() => {
    //   this.socket.unsubscribe();
    // }, 3000)
  }


  initWorker() {
    this.socket.subscribe((res) => {
      let obj: any = res;
      let data = obj?.data;
      // console.log(obj);
      if(obj?.table === 'orderBookL2_25'){
        switch(obj?.action) {
          case 'partial': 
          obj?.data.map((row:any) => {row.side == 'Sell' ? this.sellSide.push(row) : this.buySide.push(row)});
          break;

          case 'update':
          for(let i = 0; i < data.length ; i++) {
            if(data[i].side == 'Sell') {
              let refId = data[i].id;
              this.sellSide.map((row:any) => {
                if(row.id == refId) {
                  row.price = data[i].price != null && data[i].price != undefined ? data[i].price : row.price;
                  row.size = data[i].size != null && data[i].size != undefined ? data[i].size : row.size;
                }
              })
            } else if (data[i].side == 'Buy') {
              let refId = data[i].id;
              this.buySide.map((row:any) => {
                if(row.id == refId) {
                  row.price = data[i].price != null && data[i].price != undefined ? data[i].price : row.price;
                  row.size = data[i].size != null && data[i].size != undefined ? data[i].size : row.size;
                }
              })
            }
          } 
          console.log('update');
          break;

          case 'delete':
          for(let i = 0; i < data.length ; i++) {
            if(data[i].side == 'Sell') {
              let refId = data[i].id;
              this.sellSide.map((row:any) => {
                if(row.id == refId) {
                  this.sellSide.splice(this.sellSide.indexOf(row), 1);
                }
              })
            } else if(data[i].side == 'Buy') {
              let refId = data[i].id;
              this.buySide.map((row:any) => {
                if(row.id == refId) {
                  this.buySide.splice(this.buySide.indexOf(row), 1);
                }
              })
            }
          }
          break;

          case 'insert':
          for(let i = 0; i < data.length ; i++) {
            if(data[i].side == 'Sell') {
              this.sellSide.push(data[i]);
            } else if(data[i].side == 'Buy') {
              this.buySide.push(data[i]);
            }
          }
          break;
          
          default:
            break;
        }
        this.calculateAveragePrice(this.sellSide, this.buySide);
      } else if(obj?.table === 'instrument') {
        // console.log('instrument');
        console.log(obj);
      }},
      (e) => {
        console.error('error:', e);
      },
      () => {
        console.log('Socket closed');
      }
    );
  }

  stopWorker() {
    this.socket.unsubscribe();
    console.log('Socket closed');
  }

  calculateAveragePrice(array1: any, array2:any) {
    const sumArray1 = array1.reduce((a: any, b: any) => a + b.price, 0);
    const sumArray2 = array2.reduce((a: any, b: any) => a + b.price, 0);
    const totalLength = array1.length + array2.length;
    console.log(sumArray1, sumArray2);

    const totalSum = sumArray1 + sumArray2;
    const average = totalSum / totalLength;
    this.averagePrice = average;
    console.log(average);
  }
}
