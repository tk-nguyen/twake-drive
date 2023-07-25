import { DriveItemDetails} from "features/drive/types";
import {Filter} from "features/drive/state/filter";
import Languages from "features/global/services/languages-service";
import useRouteState from "features/router/hooks/use-route-state";

function usualStamp(date: string) {
    const oneDayStamp = 86400000
    const oneWeekStamp = 604800000
    const oneMonthStamp = 2678400000

    if (date === 'Today'){
        return oneDayStamp
    } else if (date === 'Last week'){
        return oneWeekStamp
    } else if (date === 'Last month'){
        return oneMonthStamp
    } else {
        return 0
    }
}

export function setFilterWithURL(filterSortId: string){
    const filters = filterSortId!.split('&')
    const sol = [
        {key:'', value:''},
        {key:'', value:''},
        {key:'', value:''},
    ]

    const filterInfo = [
    [
        { key: Languages.t('components.item_context_menu.all'), value: 'All' },
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
    ],
    [
        {key: Languages.t('components.item_context_menu.all'), value: 'All'},
        {key: Languages.t('components.item_context_menu.today'), value: 'today'},
        {key: Languages.t('components.item_context_menu.last_week'), value: 'last_week'},
        {key: Languages.t('components.item_context_menu.last_month'), value: 'last_month'},
    ],
    [
        {key: Languages.t('components.item_context_menu.default'), value: 'All'},
        {key: Languages.t('components.item_context_menu.alphabetical_order'), value: 'alphabetical_order'},
        {key: Languages.t('components.item_context_menu.anti_alphabetical_order'), value: 'anti_alphabetical_order'},
        {key: Languages.t('components.item_context_menu.ascending_modification_date'), value: 'ascending_modification_date'},
        {key: Languages.t('components.item_context_menu.descending_modification_date'), value: 'descending_modification_date'},
    ]]

    filterInfo.forEach(function (list, i) {
        list.forEach((dic) => {
            if (dic.value===filters[i]){
                sol[i].key=dic.key
                sol[i].value=dic.value
            }
        })
    })

    return sol
}

export function deleteFilters(filter:Filter){
    if (filter.mimeType.value !== '' || filter.date.value !== '' || filter.sort.value !== '') return '';
    return 'hidden'
}

export function filterSortService(details: DriveItemDetails, filter:Filter){
    const extChosen = filter.mimeType.value == '' ? 'All' : filter.mimeType.value;
    const dateChosen = filter.date.value == '' ? 'All' : filter.date.value;
    const sortChosen = filter.sort.value == '' ? 'All' : filter.sort.value;

    if (extChosen !== 'All') {
        details.children = details.children.filter((item) => item.extension === extChosen || item.is_directory);
    }
    if (dateChosen !== 'All'){
        details.children = details.children.filter((item) => item.last_modified <= Date.now() - usualStamp(dateChosen) || item.is_directory);
    }

    if (sortChosen === 'All') {
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