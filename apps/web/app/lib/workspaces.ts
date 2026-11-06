import { createClient } from "@supabase/supabase-js";
import { getSupabase } from "./evaluation-store";
export function authClient() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) throw new Error("Supabase não configurado");
  return createClient(url,key);
}
export async function signIn(email:string,password:string) {
  const {data,error}=await authClient().auth.signInWithPassword({email,password});if(error)throw error;return data;
}
export async function signUp(email:string,password:string) {
  const {data,error}=await authClient().auth.signUp({email,password});if(error)throw error;return data;
}
export async function createWorkspace(token:string,ownerId:string,name:string) {
  const {data,error}=await getSupabase(token).from("workspaces").insert({name,owner_id:ownerId}).select("id,name").single();
  if(error)throw error;return data;
}
export async function listWorkspaces(token:string) {
  const {data,error}=await getSupabase(token).from("workspaces").select("id,name,owner_id,created_at").order("created_at",{ascending:false});
  if(error)throw error;return data??[];
}
export async function addMember(token:string,workspaceId:string,userId:string,role:"editor"|"viewer") {
  const {error}=await getSupabase(token).from("workspace_members").insert({workspace_id:workspaceId,user_id:userId,role});
  if(error)throw error;
}
