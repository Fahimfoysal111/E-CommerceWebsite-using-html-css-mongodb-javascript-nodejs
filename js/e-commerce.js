function countProductInCart(){
    var listProduct = getItemInLocalStorage('cart');
    if(listProduct!=null){
        document.getElementById('productsCountInCart').innerText = listProduct.length;
    }else{
        document.getElementById('productsCountInCart').innerText = '';
    }
}

function setItemInLocalStorage(key, jsonString){
    localStorage.setItem(key, jsonString);
}

function getItemInLocalStorage(key){
    var jsonString = localStorage.getItem(key);
    if(jsonString!=null){
        return JSON.parse(jsonString);
    }
}

function removeItemInLocalStorage(key){
    localStorage.removeItem(key);
}