import { useRecoilState } from "recoil";
import { SharedWithMeFilterState } from '@features/drive/state/shared-with-me-filter';
import { DriveItem } from "app/features/drive/types";


export function selectItemByExt(ext: string){
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const extChoosed = filter.mimeType.key == '' ? 'All' : filter.mimeType.key;
  if (extChoosed === 'All' || filter.mimeType.value=='All'){
    return ''
  } else if (extChoosed != ext.toUpperCase()){
    return 'hidden '
  } else {
    return ''
  }
}

export function selectItemByLastModificationDate(date: string){
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const dateChoosed = filter.date.key == '' ? 'All' : filter.date.key;
  const oneDayStamp  = 86400000
  const oneWeekStamp = 604800000
  const oneMonthStamp= 2678400000
  if (dateChoosed === 'All'){
    return ''
  } else if (dateChoosed === 'Today' && parseInt(date)<=Date.now()-oneDayStamp){
    return 'hidden '
  } else if (dateChoosed === 'Last week' && parseInt(date)<=Date.now()-oneWeekStamp){
    return 'hidden '
  } else if (dateChoosed === 'Last week' && parseInt(date)<=Date.now()-oneMonthStamp){
    return 'hidden '
  } else {
    return ''
  }
}

export function selectItemByCreationDate(date: string){
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const dateChoosed = filter.dateCreation.key == '' ? 'All' : filter.dateCreation.key;
  const oneDayStamp  = 86400000
  const oneWeekStamp = 604800000
  const oneMonthStamp= 2678400000
  if (dateChoosed === 'All'){
    return ''
  } else if (dateChoosed === 'Today' && parseInt(date)<=Date.now()-oneDayStamp){
    return 'hidden '
  } else if (dateChoosed === 'Last week' && parseInt(date)<=Date.now()-oneWeekStamp){
    return 'hidden '
  } else if (dateChoosed === 'Last week' && parseInt(date)<=Date.now()-oneMonthStamp){
    return 'hidden '
  } else {
    return ''
  }
}

export function sort(document: DriveItem[]){
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const sortChoosed = filter.sort.key == '' ? 'All' : filter.sort.key;
  if (sortChoosed === 'All'){
    return document.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortChoosed === 'Alphabetical order'){
    return document.sort((a, b) => a.name.localeCompare(b.name))
  }else if (sortChoosed === 'Anti-alphabetical order'){
    return document.sort((a, b) => -a.name.localeCompare(b.name))
  } else if (sortChoosed === 'Ascending modification date'){
    return document.sort((a, b) => parseInt(b.last_modified)-parseInt(a.last_modified))
  } else if (sortChoosed === 'Descending modification date'){
    return document.sort((a, b) => parseInt(a.last_modified)-parseInt(b.last_modified))
  }else if (sortChoosed === 'Ascending creation date'){
    return document.sort((a, b) => parseInt(b.added)-parseInt(a.added))
  } else if (sortChoosed === 'Descending creation date') {
    return document.sort((a, b) => parseInt(a.added)-parseInt(b.added))
  } else {
    return document.sort((a, b) => a.name.localeCompare(b.name))
  }
}