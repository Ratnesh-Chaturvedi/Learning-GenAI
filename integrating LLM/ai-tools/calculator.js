export  function calculator(opr,a,b){
    if(opr=="+")return a+b;
    else if(opr=='-')return a-b;
    else if(opr=='*')return a*b;
    else {
        if(b==0)return "This division is not possible";
        return a/b;
    }
}
