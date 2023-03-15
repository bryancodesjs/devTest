import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { FirebaseService } from 'src/app/services/firebase/firebase.service';
import { Record } from 'src/app/models/record';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  socket = new WebSocketSubject('wss://ws.bitmex.com/realtime?subscribe=instrument,orderBookL2_25:XBTUSD');

  sellSide: any[] = [];
  buySide: any[] = [];
  otherAssetsArray: any[] = [];
  averagePrice: number = 0;

  dictionaryOfAssets = ['.BADAXBT','.BDOGET', '.BDOGE', '.ADAUSDPI', '.TRXBON' ,'.BBUSDT', 'ETHUSDT', 'LTCUSDT'];

  pageIsLoading: boolean = true;

  newRecord: Record = new Record();
  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.initWorker();
    //this 60-second timeout is for preventing overconsumption on my firebase plan
    setTimeout(() => {
      this.socket.unsubscribe();
    }, 60000)
  }

  ngOnDestroy(){
    this.stopWorker();
  }

  initWorker() {
    this.socket.subscribe((res) => {
      this.handleResponse(res);
      },
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

  handleResponse(res: any) {
    let obj: any = res;
      let data = obj?.data;
      // console.log(obj);
      if(obj?.table === 'orderBookL2_25'){
        // console.log(obj);
        switch(obj?.action) {
          case 'partial': 
          obj?.data.map((row:any) => {
            if(row.side == 'Sell') {
              this.sellSide.push(row);
            } else if(row.side == 'Buy') {
              this.buySide.push(row);
            }
            let tempItem: Record = new Record();
            tempItem = row;
            // console.log(tempItem);
            this.firebase.create(row);
          });
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
        
        // console.log(obj);
        switch(obj?.action) {
          case 'partial': 
          obj?.data.map((row:any) => {
            if(this.dictionaryOfAssets.includes(row.symbol)) {
              this.otherAssetsArray.push(row);
            }
          });
          break;

          case 'update':
            for(let i = 0; i < data.length ; i++) {
              let refId = data[i].symbol;
              this.otherAssetsArray.map((row:any) => {
                if(row.symbol == refId) {
                  row.bidPrice = data[i].bidPrice != null && data[i].bidPrice != undefined ? data[i].bidPrice : row.bidPrice;
                  row.askPrice = data[i].askPrice != null && data[i].askPrice != undefined ? data[i].askPrice : row.askPrice;
                  row.lastPrice = data[i].lastPrice != null && data[i].lastPrice != undefined ? data[i].lastPrice : row.lastPrice;
                }
              });
            }
            break;
          
          case 'delete':
            for(let i = 0; i < data.length ; i++) {
              let refId = data[i].symbol;
              this.otherAssetsArray.map((row:any) => {
                if(row.symbol == refId) {
                  this.otherAssetsArray.splice(this.otherAssetsArray.indexOf(row), 1);
                }
              });
            }
            break;
          
          case 'insert':
            for(let i = 0; i < data.length ; i++) {
              if(this.dictionaryOfAssets.includes(data[i].symbol)) {
                this.otherAssetsArray.push(data[i]);
              }
            }
            break;

          default: 
          break;
        }

        this.otherAssetsArray.sort((a,b) => {return b.markPrice - a.markPrice})
      }
      if(this.pageIsLoading) {
        this.pageIsLoading = false;
      }
  }

  calculateAveragePrice(array1: any, array2:any) {
    const sumArray1 = array1.reduce((a: any, b: any) => a + b.price, 0);
    const sumArray2 = array2.reduce((a: any, b: any) => a + b.price, 0);
    const totalLength = array1.length + array2.length;

    const totalSum = sumArray1 + sumArray2;
    const average = totalSum / totalLength;
    this.averagePrice = average;
  }
}
