import { DriveItemDetails} from "features/drive/types";
import {Filter} from "features/drive/state/filter";
import Languages from "features/global/services/languages-service";

class FilterService {

    constructor(){

    }

    usualStamp(date: string) {
        const oneDayStamp = 86400000
        const oneWeekStamp = 604800000
        const oneMonthStamp = 2678400000

        if (date === 'today'){
            return oneDayStamp
        } else if (date === 'last_week'){
            return oneWeekStamp
        } else if (date === 'last_month'){
            return oneMonthStamp
        } else {
            return 0
        }
    }

    setFilterURL(history:any, filterValue:string){
        const params = new URLSearchParams(history.location.search);
        params.set('filter', filterValue)
        history.push({ search: params.toString() });
    }

    setFilterWithURL(filterSortId: string){
        let filters = ['', '', ''];
        if (filterSortId !== '') filters = filterSortId!.split('-');
        
        filters.forEach((v, i)=>{
            if (v===''||v==='All') filters[i]='All'+i
        })

        const filterInfo: {key:string, value:string}[] = [
            { key: Languages.t('components.item_context_menu.all'), value: 'All0' },
            { key: 'CSV', value: 'csv' },
            { key: 'DOC', value: 'doc' },
            { key: 'DOCX', value: 'docx' },
            { key: 'GIF', value: 'gif' },
            { key: 'JPEG', value: 'jpeg' },
            { key: 'JPG', value: 'jpg' },
            { key: 'PDF', value: 'pdf' },
            { key: 'PNG', value: 'png' },
            { key: 'PPT', value: 'ppt' },
            { key: 'TXT', value: 'txt' },
            { key: 'XLS', value: 'xls' },
            { key: 'ZIP', value: 'zip' },
            {key: Languages.t('components.item_context_menu.all'), value: 'All1'},
            {key: Languages.t('components.item_context_menu.today'), value: 'today'},
            {key: Languages.t('components.item_context_menu.last_week'), value: 'last_week'},
            {key: Languages.t('components.item_context_menu.last_month'), value: 'last_month'},
            {key: Languages.t('components.item_context_menu.default'), value: 'All2'},
            {key: Languages.t('components.item_context_menu.alphabetical_order'), value: 'alphabetical_order'},
            {key: Languages.t('components.item_context_menu.anti_alphabetical_order'), value: 'anti_alphabetical_order'},
            {key: Languages.t('components.item_context_menu.ascending_modification_date'), value: 'ascending_modification_date'},
            {key: Languages.t('components.item_context_menu.descending_modification_date'), value: 'descending_modification_date'},
        ]

        const filterChose = filterInfo.filter((f) => filters.includes(f.value))

        filterChose.forEach((v, i)=>{
            if (v.value==='All'+i) filterChose[i].value=''
        })
        return filterChose
    }

    deleteFilters(filter:Filter){
        if (filter.mimeType.value !== '' || filter.date.value !== '' || filter.sort.value !== '') return '';
        return 'hidden'
    }

    filterSortService(details: DriveItemDetails, filter:Filter){

        const extChosen = filter.mimeType.value;
        const dateChosen = filter.date.value;
        const sortChosen = filter.sort.value;

        if (extChosen !== '') {
            details.children = details.children.filter((item) => item.extension === extChosen || item.is_directory);
        }
        if (dateChosen !== ''){
            details.children = details.children.filter((item) => item.last_modified >= Date.now() - this.usualStamp(dateChosen) || item.is_directory);
        }

        if (sortChosen === '') {
            details.children.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortChosen === 'alphabetical_order') {
            details.children.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortChosen === 'anti_alphabetical_order') {
            details.children.sort((a, b) => -a.name.localeCompare(b.name))
        } else if (sortChosen === 'ascending_modification_date') {
            details.children.sort((a, b) => b.last_modified - a.last_modified)
        } else if (sortChosen === 'descending_modification_date') {
            details.children.sort((a, b) => a.last_modified - b.last_modified)
        } else {
            details.children.sort((a, b) => a.name.localeCompare(b.name))
        }
        return details
    }
}

export default new FilterService();