import {
  Button,
  Container,
  render,
  VerticalSpace,
  Text,
  Banner,
  IconInfo32,
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'

import styles from './styles.css'
import { FirstNodeHandler, RunAppHandler, SelectTextNodeHandler } from './types'

function Plugin() {
  const [firstNodeArray, setFirstNodeArray] = useState<SceneNode[] | null>([])
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const handleRunAppButtonClick = useCallback(
    function () {
      emit<RunAppHandler>('RUN_APP')
    },
    []
  )
  const handleSelectTextNodeButtonClick = (node: TextNode) => emit<SelectTextNodeHandler>('SELECT_TEXT_NODE', node)

  on<FirstNodeHandler>('FIRST_NODE', function (nodeArray: SceneNode[]) {
    // Reduce the size of our array of errors by removing nodes with no errors on them.
    let filteredErrorArray = nodeArray.filter(
      (item: any) => item.errors !== undefined && item.errors.length >= 1
    );

    setIsSelected(nodeArray.length > 0)
    setFirstNodeArray(filteredErrorArray)
  })

  return (
    <Container space="medium">
      <VerticalSpace space="small" />
      <div class={styles.container}>
        {
          firstNodeArray && firstNodeArray.length > 0 ?
            firstNodeArray.map((item: any, index) => {
              console.log("item", item);
              return (
                <Banner variant="warning" icon={<IconInfo32 />} style={{ "margin-bottom": "10px" }}>
                  <Text style={{ "margin-bottom": "10px", "color": "black" }}>{`${index + 1}. テキストスタイルが適用されていません`}</Text>
                  <Text style={{ "margin-bottom": "10px", "color": "black" }}>{item.errors[0].value}</Text>
                  <Button danger onClick={() => {
                    handleSelectTextNodeButtonClick(item)
                  }}>選択する</Button>
                </Banner>
              )
            })
            : (
              isSelected ? (<Text>テキストスタイルの適用漏れはありません</Text>) : (<Text>フレームを選択して下さい</Text>)
            )
        }
      </div>
      <VerticalSpace space="large" />
      <Button fullWidth onClick={handleRunAppButtonClick}>
        テキストスタイルの適用漏れを検出する
      </Button>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
