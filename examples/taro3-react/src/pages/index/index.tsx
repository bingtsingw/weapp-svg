import { IconArrowLeftUpLine, IconArrowRightLine, IconArrowRightUpLine, IconArrowUpLine } from '@/src/components/icons';
import { Text, View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import './index.css';

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
  });

  return (
    <View className="index">
      <Text>Hello world!</Text>
      <View>
        <IconArrowLeftUpLine style={{ display: 'inline-block' }} />
        <IconArrowRightLine style={{ display: 'inline-block' }} />
        <IconArrowRightUpLine style={{ display: 'inline-block' }} color="ccc" />
        <IconArrowUpLine style={{ display: 'inline-block' }} color="red" />
      </View>
    </View>
  );
}
