import {PlaylistsPage} from "@/features/playlists/ui/PlaylistsPage.tsx";
import {TracksPage} from "@/features/tracks/ui/TracksPage.tsx";
import {ProfilePage} from "@/features/auth/ui/ProfilePage/ProfilePage.tsx";
import {MainPage} from "@/app/ui/MainPage/MainPage.tsx";
import {Route, Routes} from "react-router";
import {PageNotFound} from "@/common/components";
import {Path} from "@/common/routing/paths.ts";
import {OAuthCallback} from "@/features/auth/ui/OAuthCallback/OAuthCallback.tsx";



export const Routing = () => (
    <Routes>
        <Route path={Path.Main} element={<MainPage />} />
        <Route path={Path.Playlists} element={<PlaylistsPage />} />
        <Route path={Path.Tracks} element={<TracksPage />} />
        <Route path={Path.Profile} element={<ProfilePage />} />
        <Route path={Path.OAuthRedirect} element={<OAuthCallback />} />
        <Route path={Path.NotFound} element={<PageNotFound />} />
    </Routes>
)