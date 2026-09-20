import {useGetMeQuery} from "@/features/auth/api/authApi.ts";

export const MainPage = () => {
    const {data, error} = useGetMeQuery()
    console.log(error)
    return (
        <div>
            <h1>Main page</h1>
            <h1>Login: {data?.login}</h1>
        </div>
    )
}