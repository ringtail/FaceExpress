function PageSystem(count, divID, grountCount, callBack) {
     this.totolCount = count; //总记录数
     this.initMaxPage = grountCount? grountCount: 5;  //显示页数，如 1 2 3 4 5
     this.pageSize = 10;  //每页记录数
     this.currentMax = 0; //当前显示的最大页码, 如 1 2 3 4 5; 5为最大页码
     this.currentMin = 0; //当前显示的最小页码, 如 11 12 13 14 15; 11为最小页码
     this.homePage = 0; //首页
     this.endPage = 0; //未页
     this.currentPage = 0; //当前页
     this.currentActiveSpan; //当前活动a容器
     this.pageDivObj = document.getElementById(divID); //分页系统容器
     this.pages = 0; //总页数，计算得到
     //this._url = _url; //提交URL
     this.callBack = callBack; //回调
     var that = this; //指针的引用
     
    
     this.init = function() {
        this.pages = parseInt(this.totolCount / this.pageSize); //获得总共有几页
        this.pages = this.totolCount % this.pageSize == 0? this.pages: this.pages+1;
        this.createHomePage();
        this.createPrePage();
        var n = 1;
        while(n <= this.pages) {
          if(n > this.initMaxPage){
             break; //到达最大显示数
          }
          var _span = document.createElement("SPAN");
          _span.style.cssText = "margin-left:10px";
          if(n == 1) { //初始化时第一页为活动页  初始化显示第一页 所以当前页无链接 下划线
            _span.innerText = n;//显示数字
            this.currentActiveSpan = _span;//当前页
          }else{
             var _a = document.createElement("A");
             _a.href = "#";
            _a.onclick = this.reView;
            _a.innerText = n;
            _span.appendChild(_a);//<span><a></a></span>
          }
          this.pageDivObj.appendChild(_span);//容器内增加一个<span>
          n++;
        }
        if(this.pages != 0) {
          this.currentMax = n - 1; //当前组最大页码 1 2 3 4 5值为5
          this.currentMin = 1; //当前最小页码 1 2 3 4 5 值为1
          this.homePage = 1; //首页
          this.endPage = this.pages; //未页
          this.currentPage = 1; //当前页
        }
        //alert(this.currentMax);
        //alert(this.currentMin);
        this.createNextPage();
        this.createEndPage();
       
       
       
    };
    this.query = function() {
      var curPage = that.currentPage; //当前页
      var pageSize = that.pageSize;
      if(that.callBack) that.callBack(curPage, pageSize);
          
    };
    this.reView = function() {
     //重新渲染UI
       that.reViewActivePage();
       that.query();
    };
    this.reViewActivePage = function() {
      //重新渲染当前页视图
      var actA = event.srcElement; //当前被点击的 a对象
      var ap = actA.parentNode; //获得当前a容器span对象
      //还原当前页视图
       var _a = document.createElement("A");
        _a.href = "#";
        _a.onclick = this.reView;
        _a.innerText = that.currentActiveSpan.innerText;
        that.currentActiveSpan.innerText = "";
        that.currentActiveSpan.appendChild(_a);
       //渲染新的当前页视图
       that.currentActiveSpan = ap; //切换当前活动页容器
       var curPage = parseInt(actA.innerText);
       that.currentActiveSpan.removeChild(actA);
       that.currentActiveSpan.innerText = curPage;
       this.currentPage = curPage; //更改当前页码
       if(!that.toNextGroup()) that.toPreGroup();
    };
    this.toNextGroup = function() {
       //重新渲染显示页下一组 1 2 3 4 5 --> 5 6 7 8 9
       if(that.currentPage == that.currentMax) {//点击的页码为当前组最大页码，当go 下一组
         if(that.currentPage != that.endPage) { //如果点了未页当然不会再有下一组啦！
            that.pageDivObj.innerHTML = ""; //@1
            var pageCode = parseInt(that.currentPage) + 1; //显示页码
            var n = 2; //当前活动页不重创
            this.createHomePage();
            this.createPrePage();
            that.currentActiveSpan.innerText = that.currentPage;
            that.pageDivObj.appendChild(that.currentActiveSpan); //将当前活动页回放,请看@1
            while(pageCode <= that.pages) {
            if(n > that.initMaxPage){
               break; //到达最大显示数
            }
            var _span = document.createElement("SPAN");
            _span.style.cssText = "margin-left:10px";
            var _a = document.createElement("A");
             _a.href = "#";
            _a.onclick = that.reView;
            _a.innerText = pageCode;
            _span.appendChild(_a);
            that.pageDivObj.appendChild(_span);
            pageCode++;
            n++;
          }
          that.currentMax = pageCode - 1;
          that.currentMin = that.currentPage;
         // alert("currentMax: " + that.currentMax);
         // alert("currentMin: " + that.currentMin);
          this.createNextPage();
          that.createEndPage();
          return true;
         }//end if
       }//end if
       return false;
    };
    this.toPreGroup = function() { //
      //重新渲染显示页上一组 5 6 7 8 9 -->1 2 3 4 5
      if(that.currentPage == that.currentMin) { //点了组中最小页码
        if(that.currentPage != 1) {
           that.pageDivObj.innerHTML = ""; //@2
            var pageCode = parseInt(that.currentPage) - (that.initMaxPage -1); //显示页码
            var n = 2; //当前活动页不重创
            this.createHomePage();
            this.createPrePage();
            while(true) {
            if(n > that.initMaxPage){
               break; //到达最大显示数
            }
            var _span = document.createElement("SPAN");
            _span.style.cssText = "margin-left:10px";
            var _a = document.createElement("A");
             _a.href = "#";
            _a.onclick = that.reView;
            _a.innerText = pageCode++;
            _span.appendChild(_a);
            that.pageDivObj.appendChild(_span);
            n++;
          }
          that.currentMax = that.currentPage;
          that.currentMin = pageCode - (that.initMaxPage -1);
          //alert("currentMax: " + that.currentMax);
         // alert("currentMin" + that.currentMin);
          that.currentActiveSpan.innerText = that.currentPage;
            that.pageDivObj.appendChild(that.currentActiveSpan); //将当前活动页回放,请看@2
            that.createNextPage();
            that.createEndPage();
        }//end if
      }//end if
    };
     this.toHomePage = function(){
       //去到首页
       if(that.pages == 0) return;
       if(that.currentPage != 1) {//切组
         that.pageDivObj.innerHTML = "";
         that.init();
       }//end if
       that.currentPage = 1;
       that.currentMin = 1;
       that.currentMax = that.initMaxPage;
       that.query();
     };
     this.toEndPage = function() {
       //去到未页
        if(that.pages == 0 ||that.currentPage == that.pages) return;
        if(true) {//切组条件修改，此条件作废,临时设为true
        that.pageDivObj.innerHTML = "";
        that.createHomePage();
        that.createPrePage();
        var pageCode = 1;
     var n = 1;
      while(pageCode <= that.pages) {
        if(n > that.initMaxPage-1){
          n = 1;
        }
        n++;
        pageCode++;
      }
      
      pageCode = that.pages - (n-2);
      for(var j = 1; j < n; j++) {
         var _span = document.createElement("SPAN");
       _span.style.cssText = "margin-left:10px";
       if(pageCode == that.pages) { //初始化时第一页为活动页
        _span.innerText = pageCode;
        that.currentActiveSpan = _span;
       }else{
         var _a = document.createElement("A");
         _a.href = "#";
         _a.onclick = that.reView;
         _a.innerText = pageCode;
         _span.appendChild(_a);
         pageCode++;
       }
       that.pageDivObj.appendChild(_span);
      }
       
         that.createNextPage();
          that.createEndPage();
       }//end if
       that.currentPage = that.pages;
       that.currentMin = that.pages - (n-2);
       that.currentMax = that.pages;
      // alert("currentMin: " + that.currentMin);
       //alert("currentMax: " + that.currentMax);
      // alert("pages: " + that.pages);
       that.query();
     };
     
     this.next = function() {
       //下一页
     };
     this.pre = function() {
       //上一页
     };
     this.update = function(count) {
       //更新分页系统
       this.totolCount = count;
       that.pageDivObj.innerHTML = "";
       this.init();
     }; 
     this.createPrePage = function() {
       return;
       var _span = document.createElement("SPAN");
       _span.style.cssText = "margin-left:16px";
       var _a = document.createElement("A");
       _a.href = "#";
       _a.onclick = this.pre;
       _a.innerText = "上一页";
       _span.appendChild(_a);
       this.pageDivObj.appendChild(_span);
     };
     this.createNextPage = function() {
       return;
       var _span = document.createElement("SPAN");
       _span.style.cssText = "margin-left:16px";
       var _a = document.createElement("A");
       _a.href = "#";
       _a.onclick = this.next;
       _a.innerText = "下一页";
       _span.appendChild(_a);
       this.pageDivObj.appendChild(_span);
     };
     this.createHomePage = function() {
       var homeSpan = document.createElement("SPAN");
       var _a = document.createElement("A");
       _a.href = "#";
       _a.onclick = this.toHomePage;
       _a.innerText = "首页";
       homeSpan.appendChild(_a);
       this.pageDivObj.appendChild(homeSpan);
     };
     this.createEndPage = function() {
       var _span = document.createElement("SPAN");
       _span.style.cssText = "margin-left:16px";
       var _a = document.createElement("A");
       _a.href = "#";
       _a.onclick = this.toEndPage;
       _a.innerText = "未页(" + this.pages +")";
       _span.appendChild(_a);
       this.pageDivObj.appendChild(_span);
     }
   }