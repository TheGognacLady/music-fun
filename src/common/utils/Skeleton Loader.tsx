import Skeleton from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css'

type Props = {
    title: string
}
export const SkeletonLoader = ({title}: Props) => {
    return (
        <div>
            <h1>{title && <Skeleton/>}</h1>
            <Skeleton count={10}/>
        </div>
    )
}

