import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const MENU_HEIGHT_PX = 40
export const SCALE = 500
export const CENTER = [-78, 26]

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const adminIds = ["clyeotzuy00007jphvhta603b"]

export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const TOOLTIP_WIDTH_PX = 150
const TOOLTIP_HEIGHT_PX = 160
const TOOLTIP_Y_OFFSET = 50
export function positionTooltip(e) {
  if (isMobile()) return
  const tt = document.querySelector(".map-tooltip")
  if (e.pageX + TOOLTIP_WIDTH_PX / 2 > window.innerWidth) {
    // left view, since it's too far right
    tt.style.left = (e.pageX - TOOLTIP_WIDTH_PX - TOOLTIP_Y_OFFSET) + "px"
  } else if (e.pageX - TOOLTIP_WIDTH_PX / 2 < 0) {
    // right view, since it's too far left
    tt.style.left = (e.pageX + TOOLTIP_Y_OFFSET) + "px"
  } else {
    // clear space, use center view
    tt.style.left = (e.pageX - tt.offsetWidth / 2) + "px"
  }
  if (e.pageY + TOOLTIP_HEIGHT_PX + TOOLTIP_Y_OFFSET > window.innerHeight) {
    // top view, since it's too low
    tt.style.top = (e.pageY - TOOLTIP_Y_OFFSET - TOOLTIP_HEIGHT_PX) + "px"
  } else {
    // clear space, use bottom view
    tt.style.top = (e.pageY + TOOLTIP_Y_OFFSET) + "px"
  }
  tt.style.visibility = "visible"
}

export function getConsts(map) {
  if (map === "fallout") {
    return {
      CENTER: [-100, 40],
      SCALE: 1400,
    }
  } else if (map === "lancer") {
    return {
      CENTER: [-78, 26],
      SCALE: 400,
    }
  }
}

// export function useScreen(selection) {
//   const [screenSize, setScreenSize] = useState()

//   useEffect(() => {
//     // fit to an element or take up whole window
//     if (selection) {
//       if (document.querySelector(selection)) {
//         const width = document.querySelector(selection).clientWidth
//         if (width < 500) {
//           setScreenSize({ width, height: width })
//         } else {
//           setScreenSize({ width: width - 100, height: width - 100 })
//         }
//       }
//     } else {
//       setScreenSize({ width: window.innerWidth, height: window.innerHeight })
//       const handleResize = () => {
//         setScreenSize({ width: window.innerWidth, height: window.innerHeight })
//       }
//       window.addEventListener('resize', handleResize)
//       return () => window.removeEventListener('resize', handleResize)
//     }
//   }, [])

//   if (!screenSize) return null

//   return ({
//     height: screenSize.height - MENU_HEIGHT_PX,
//     width: screenSize.width,
//   })
// }

export function isMobile() {
  if (typeof navigator === 'undefined' || typeof window === "undefined") return false
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);

  // add ipads to mobile
  if ('ontouchstart' in window) return true
  return check;
}


// use color
export const styles = {
  territory: {
    strokeWidth: 3,
    opacity: 1,
    fillRandom: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    stroke: "black",
  },
  territoryLabel: {

  },
  guide: {
    strokeWidth: 2,
    opacity: 1,
    fill: "none",
    stroke: "rgba(255, 255, 255, 0.2)",
  },
  guideLabel: {
    fontSize: ".7em",
    fill: "white",
  },
  locationMinor: {
    // TODO: lancer has two fills for this
    fill: "slategray",
    stroke: "black",
    opacity: 1,
  },
  locationMajor: {
    // TODO: lancer has two fills for this
    fill: "teal",
    stroke: "black",
    opacity: 1,
  },
  locationLabel: {
    // TODO: dependent on location size
    fontSizeDefault: "8px",
    fontWeightDefault: 600,
    fill: "white",
    opacity: 0
  },
}

export function important(map, { name, type, faction }) {
  if (map === "fallout") {
    if (type === "vault") return true
  } else if (map === "lancer") {
    if (type === "gate") return true
  }
  return false
}

export const bg = {
  "lancer": "#000A2E 0%, #000000 100%",
  "fallout": "#06402B 0%, #000000 100%",
}

export function accent(map, opacity) {
  let rgb = ""
  if (map === "lancer") {
    rgb = "61,150,98"
  } else if (map === "fallout") {
    rgb = "255,215,120"
  }
  return `rgba(${rgb},${opacity})`
}

export const searchBar = {
  "lancer": {
    background: "rgb(2 6 15)",
    border: "rgb(30 41 59)"
  },
  "fallout": {
    background: "#020e03",
    border: "#0a400d",
  },
}

export const ignoreList = {
  "lancer": ["line", "cluster"],
  "fallout": ["country", "state"],
}

export function genLink(d, map) {
  if (map === "lancer") {
    // TODO: find a good id system
    return `/contribute`
  } else if (map === "fallout") {
    return `https://fallout.fandom.com/wiki/Special:Search?query=${encodeURIComponent(d.properties.name)}`
  }
}

export function color(map, { name, type, faction, destroyed }, style, geo) {

  if (map === "fallout") {
    if (style === "stroke") {
      if (geo === "Point") {
        // locations
        if (type === "base") return "rgb(229 218 172)"
        if (type === "city") return "rgb(115 142 131)"
        if (type === "settlement") return "rgb(290 19 38)"
        if (type === "vault") return "#6ea7ff"
        if (type === "building") return "rgb(11 89 75)"
        if (type === "cave") return "rgb(71 39 61)"
        if (type === "region") return "rgb(142 232 237)"
        if (type === "compound") return "rgb(200 100 130)"
        return "rgb(96 0 148)"
      } else if (geo === "LineString") {
        // guides
        return "rgb(139 178 141)"
      } else {
        // territory
        if (faction === "Brotherhood of Steel") return "rgba(39, 122, 245, 0.1)"
        if (faction === "Ceasar's Legion") return "rgba(245, 81, 39, 0.2)"
        if (faction === "NCR") return "rgba(133, 92, 0,.5)"
        if (type === "region") return "rgba(142, 232, 237, .1)"
        if (destroyed) return "rgba(0,0,0,.2)"
        return "rgba(60, 150, 60, .5)"

      }
      // if (type === "cluster") return "rgba(39, 83, 245, 0.3)"
      // if (type === "guide") return "rgba(255, 255, 255, 0.2)"
    } else if (style === "fill") {

      if (geo === "Point") {
        // locations
        if (type === "base") return "rgb(229 218 172)"
        if (type === "city") return "rgb(115 142 131)"
        if (type === "settlement") return "rgb(50 90 38)"
        if (type === "vault") return "#6ea7ff"
        if (type === "building") return "rgb(11 89 75)"
        if (type === "cave") return "rgb(71 39 61)"
        if (type === "region") return "rgb(142 232 237)"
        if (type === "compound") return "rgb(20 40 115)"
        return "rgb(96 0 48)"
      } else if (geo === "LineString") {
        // guides
        return "rgb(139 178 141)"
      } else {
        // territory
        if (faction === "Brotherhood of Steel") return "rgba(39, 122, 245, 0.04)"
        if (faction === "Ceasar's Legion") return "rgba(245, 81, 39, 0.08)"
        if (faction === "NCR") return "rgba(133, 92, 0,.1)"
        if (destroyed) return "rgba(0,0,0,.2)"
        if (type === "region") return "rgba(142, 232, 237, .05)"
        if (type === "state") return "rgb(39, 39, 40)"
        if (type === "country") return "rgb(39, 39, 40)"
        if (type === "province") return "rgb(39, 39, 40)"
        if (type === "territory") return "rgb(39, 39, 40, 0.04)"
        return "rgba(142, 232, 237, .04)"
      }
    }
  } else if (map === "lancer") {
    if (style === "stroke") {
      if (type === "line") return "rgba(255, 255, 255, 0.05)";
      if (type === "cluster") return "rgba(39, 83, 245, 0.3)";
      if (name === "Karrakis Trade Baronies") return "rgba(133, 92, 0,1)";
      if (name === "Harrison Armory") return "rgba(99, 0, 128, 1)";
      if (name === "IPS-N") return "rgba(128, 0, 0, 1)"
      if (faction === "interest") return "rgba(84, 153, 199, .3)"
      if (name === "Union Coreworlds") return "rgba(245, 39, 39, 0.3)"
      if (type === "territory") return "rgba(255, 255, 255, 0.2)";
      return "black";
    } else if (style === "fill") {
      if (type === "station") return "rgba(39, 122, 245, 1)";
      if (type === "jovian") return "rgba(39, 122, 245, 1)";
      if (type === "terrestrial") return "rgba(39, 122, 245, 1)";
      if (type === "moon") return "rgba(39, 122, 245, 1)";
      if (type === "cluster") return "rgba(39, 122, 245, 0.1)";
      if (faction === "KTB") return "rgba(133, 92, 0,.4)";
      if (faction === "HA") return "rgba(99, 0, 128, .4)";
      if (faction === "IPS-N") return "rgba(128, 0, 0, .4)";
      if (faction === "union") return "rgba(245, 81, 39, 0.2)"
      if (name === "The Interest") return "rgba(84, 153, 199, .3)"
      if (name === "The Long Rim") return "rgba(84, 153, 199, .3)"
      if (type === "gate") return "teal";
      if (type === "star") return "lightgray";
      if (type === "line") return "none";
      return "rgba(255, 255, 255, 0.2)";
    }
  }
}


/*
opacity
stroke-width


territory
lines / guide
territory labels
lines / guide labels
locations small
locations large
location labels


background
- stars
-
*/
