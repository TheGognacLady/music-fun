import {
    useFetchPlaylistsQuery,
} from "@/features/playlists/api/playlistsApi.ts";
import s from './PlaylistsPage.module.css'
import {type ChangeEvent, useState} from "react";
import {useDebounceValue} from "@/common/hooks";
import {Pagination} from "@/common/components";
import {PlaylistsList} from "@/features/playlists/ui/PlaylistList/PlaylistsList.tsx";
import {SkeletonLoader} from "@/common/utils/Skeleton Loader.tsx";

export const PlaylistsPage = () => {
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(2)

    const debouncedSearch = useDebounceValue(search)
    const {data, isLoading} = useFetchPlaylistsQuery({
        search: debouncedSearch,
        pageNumber: currentPage,
        pageSize
    })


    const setPageSizeHandler = (size: number) => {
        setCurrentPage(1)
        setPageSize(size)
    }

    const searchPlaylistHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value)
        setCurrentPage(1)
    }

    if (isLoading) {
        return <SkeletonLoader title={'Loading...'}/>
    }

    return (
        <div className={s.container}>
            <h1>Playlists page</h1>


            <input
                type="search"
                placeholder="Search playlist by title"
                onChange={(event) => searchPlaylistHandler(event)}
            />
            <PlaylistsList playlists={data?.data || []} isPlaylistsLoading={isLoading}/>
            <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagesCount={data?.meta.pagesCount || 1}
                pageSize={pageSize}
                changePageSize={setPageSizeHandler}
            />
        </div>
    )
}