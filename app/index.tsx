//this is the main screen,the first screen that is shown when app is opened.
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";


export default function Splash() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} >
        <ActivityIndicator size="large" color="#ff1764cc" />
        <Text> Loading... </Text>
      </View>
    );
  }

  return <Redirect href="/signup" />;


}
