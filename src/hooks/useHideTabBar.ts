import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

const VISIBLE_TAB_BAR_STYLE = {
  borderTopWidth: 1,
  borderTopColor: '#EEEEEE',
  backgroundColor: '#FFFFFF',
  height: 60,
  paddingBottom: 8,
};

export function useHideTabBar() {
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions({ tabBarStyle: VISIBLE_TAB_BAR_STYLE });
      };
    }, [navigation])
  );
}
