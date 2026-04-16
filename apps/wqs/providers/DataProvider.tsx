import { createContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ICommonData } from "@/types/common";

export const DataContext = createContext<ICommonData>({
    waterTypes: [],
    tests: []
})


export default function DataProvider({children}: {children: React.ReactNode}): React.JSX.Element {
    // const [waterTypes, setWaterTypes] = useState<WaterType[]>([]);
    const [data, setData] = useState<ICommonData>({
        waterTypes: [],
        tests: []
    })
    useEffect(() => {
        try {
            api.get("/data").then((response) => {
                if (response.status === 200) {
                    setData(response.data as ICommonData)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }, [])
    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    );
}