import { memo, useEffect, useState } from 'react';
import Drawer from '@/components/Elements/Drawer/Drawer';
import Icon, { IconDiagramProject } from '@/components/Elements/Icon/Icon';
import Divider from '@/components/Elements/Divider/Divider';
import Text from '@/components/Elements/Text/Text';
import * as Styled from './DiagramDrawer.styled';
import api from '@/services/api';
import type { IDiagram } from 'shared';
import DiagramItemCard from '../DiagramItemCard/DiagramItemCard';

const DiagramDrawer = () => {
  const [diagrams, setDiagrams] = useState<IDiagram[]>([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);

    (async () => {
      const { data } = await api.getDiagrams({
        signal: abortController.signal,
      });

      if (data) {
        setDiagrams(data.data);
      }
    })();

    setLoading(false);
    return () => {
      if (abortController.signal) {
        abortController.abort();
      }
    };
  }, [reload, open]);

  const handleOnInteractionOutside = (event: Event) => event.preventDefault();

  return (
    <Drawer open={open} onClose={() => setOpen(false)} modal={false}>
      <Drawer.Trigger
        align="between"
        color="secondary"
        size="sm"
        gap="sm"
        data-testid="diagram-drawer-trigger"
        onClick={() => setOpen(true)}
      >
        <IconDiagramProject />
        <Text size="sm">Diagrams</Text>
      </Drawer.Trigger>
      <Styled.Content onInteractOutside={handleOnInteractionOutside}>
        <Drawer.Header>
          <Drawer.Title>Diagrams</Drawer.Title>
          <Drawer.Close>
            <Icon name="x" />
          </Drawer.Close>
        </Drawer.Header>
        <Divider />
        <Styled.ItemsSection>
          <Styled.ItemsHeader>
            <Text weight="bold">Diagram items</Text>
          </Styled.ItemsHeader>
          {!loading && diagrams.length > 0 ? (
            <Styled.Items>
              {diagrams.map((item) => {
                return (
                  <DiagramItemCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    setReload={setReload}
                  />
                );
              })}
            </Styled.Items>
          ) : null}
          {loading && (
            <Text color="gray600" align="center" size="sm">
              Loading...
            </Text>
          )}
          {!loading && diagrams.length === 0 && (
            <Text color="gray600" align="center" size="sm">
              Empty diagram...
            </Text>
          )}
        </Styled.ItemsSection>
      </Styled.Content>
    </Drawer>
  );
};

export default memo(DiagramDrawer);
