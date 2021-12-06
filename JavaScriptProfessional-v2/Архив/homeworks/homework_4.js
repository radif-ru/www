const text = '';
const newText = text.replace(/\B\'\b|\b\'\B/gm, '"');

function search(searchText, goods){
    return goods.filter(({name}) => new RegExp(searchText, 'i').test(name));
}