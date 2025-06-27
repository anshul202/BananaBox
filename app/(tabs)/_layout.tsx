import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import { Image, ImageBackground, StatusBar, Text, View } from "react-native";


const TabIcon=({focused,icons,title}:any)=>{
  if(focused){
    return (
     <ImageBackground source={images.highlight2}  className="flex flex-row items-center justify-center rounded-full w-full flex-1 min-w-[100px] min-h-16 mt-4 overflow-hidden">
        <Image source={icons} tintColor={"#151312"} className="size-5"/>
        <Text className="text- text-base font-semibold ml-2">{title}</Text>
      </ImageBackground>
  )
  }
  return (
    <View  className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icons} className="size-5" tintColor={"#A8B5DB"} />
    </View>
  )
}

export default function TabsLayout() {
  return (
    <>
    <StatusBar hidden={true} />
    <Tabs
    screenOptions={{
      tabBarShowLabel:false,
      tabBarItemStyle:{
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      },
      tabBarStyle:{
        backgroundColor:"#151312",
        borderRadius:50,
        marginHorizontal:20,
        marginBottom:36,
        height:52,
        position:"absolute",
        overflow:"hidden",
        borderWidth:1,
        borderColor:"#A8B5DB",
      }
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "home",
          headerShown: false,
          tabBarIcon:({focused})=><>
            <TabIcon 
            focused={focused} 
            icons={icons.home}
            title="Home"
            />
          </>
        }} />
      <Tabs.Screen
      name="search"
      options={{
        title: "",
        headerShown: false,
        tabBarIcon:({focused})=><>
        <TabIcon 
            focused={focused} 
            icons={icons.search}
            title="Search"
          />
        </>
      }}
      />
      <Tabs.Screen
      name="saved"
      options={{
        title: "",
        headerShown: false,
        tabBarIcon:({focused})=><>
            <TabIcon 
            focused={focused} 
            icons={icons.save}
            title="Saved"
          />
        </>
      }}
      />
      <Tabs.Screen
      name="profile"
      options={{
        title: "",
        headerShown: false,
        tabBarIcon:({focused})=><>
            <TabIcon 
            focused={focused} 
            icons={icons.person}
            title="Profile"
          />
        </>
      }}
      />
    </Tabs>
    </>
  );
}