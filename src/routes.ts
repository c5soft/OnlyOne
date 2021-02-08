// Components

import OnlyOne from "./routes/OnlyOne.svelte"
import HotelFeeStd from "./routes/HotelFeeStd.svelte"
import GlobalFeeStd from "./routes/GlobalFeeStd.svelte"
import Home from "./routes/Home.svelte";
import Login from "./routes/Login.svelte";
import WorkloadDept from "./routes/WorkloadDept.svelte";
import WorkloadOper from "./routes/WorkloadOper.svelte";
import WujinFH from "./routes/WujinFH.svelte";
import Name from './routes/Name.svelte';
import Wild from './routes/Wild.svelte';
import NotFound from './routes/NotFound.svelte';
import CheckNCYE from './routes/CheckNCYE.svelte';
import Ledger from "./routes/Ledger.svelte";
import Balance from "./routes/Balance.svelte";
import Examer from "./routes/Examer.svelte";

// Export the route definition object
export default {
    // Exact path
    '/': OnlyOne,
    '/workloaddept': WorkloadDept,
    '/workloadoper': WorkloadOper,
    '/login': Login,
    '/onlyone':OnlyOne,
    '/hotelfee':HotelFeeStd,
    '/globalfee':GlobalFeeStd,
    '/wujinfh':WujinFH,
    '/home': Home,
    '/checkncye':CheckNCYE,
    '/ledger':Ledger,
    '/balance':Balance,
    '/examer':Examer,

    // Using named parameters, with last being optional
    '/hello/:first/:last?': Name,

    // Wildcard parameter
    // Included twice to match both `/wild` (and nothing after) and `/wild/*` (with anything after)
    '/wild': Wild,
    '/wild/*': Wild,

    // Catch-all, must be last
    '*': NotFound,
}
