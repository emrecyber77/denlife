import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name:"DENLIFE", short_name:"DENLIFE", description:"Denizli şehir rehberi", start_url:"/", display:"standalone", background_color:"#000000", theme_color:"#20e878", lang:"tr" }; }
