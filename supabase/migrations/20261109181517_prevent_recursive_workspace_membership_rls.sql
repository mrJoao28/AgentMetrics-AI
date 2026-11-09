-- Applied to Supabase project AgentMetrics AI as migration 20261109181517.
-- Prevent circular RLS evaluation between public.workspaces and public.workspace_members.
-- A user can read their own membership; owners retain separate INSERT/UPDATE/DELETE policies.
drop policy if exists members_read on public.workspace_members;
create policy members_read on public.workspace_members
  for select to authenticated
  using (user_id = (select auth.uid()));
