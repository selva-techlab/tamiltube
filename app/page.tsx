// Homepage. Runs on the server at build time: reads the JSON once and hands
// it to the interactive browser. Nothing to query at request time.

import VideoBrowser from "@/components/VideoBrowser";
import { getAllSources, getAllTags, getCategories, getVideos } from "@/lib/videos";

export default function Home() {
  return (
    <VideoBrowser
      videos={getVideos()}
      categories={getCategories()}
      tags={getAllTags()}
      sources={getAllSources()}
    />
  );
}
