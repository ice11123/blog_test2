import type { APIRoute, GetStaticPaths } from 'astro';
import { getSearchIndex } from '../../lib/blogData';

export const getStaticPaths: GetStaticPaths = async () => {
  const { version, body } = await getSearchIndex();
  return [{ params: { version }, props: { body } }];
};

export const GET: APIRoute = ({ props }) => new Response(props.body, {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
