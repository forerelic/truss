"use client";

import React, { useState } from "react";
import { authClient } from "../lib/auth/client";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Card } from "../components/card";

export function AuthTestView() {
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  const handleSignUp = async () => {
    try {
      await authClient.signUp.email({ email, password, name });
      alert("Sign up successful!");
    } catch (error) {
      alert("Sign up failed: " + (error as Error).message);
    }
  };

  const handleSignIn = async () => {
    try {
      await authClient.signIn.email({ email, password });
      alert("Sign in successful!");
    } catch (error) {
      alert("Sign in failed: " + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      alert("Signed out!");
    } catch (error) {
      alert("Sign out failed: " + (error as Error).message);
    }
  };

  const handleCreateOrg = async () => {
    try {
      await authClient.organization.create({ name: orgName, slug: orgSlug });
      alert("Organization created!");
    } catch (error) {
      alert("Create org failed: " + (error as Error).message);
    }
  };

  if (!session) {
    return (
      <div className="p-8 space-y-4 max-w-md mx-auto">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Sign Up</h2>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleSignUp} className="w-full">
            Sign Up
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleSignIn} className="w-full">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">User Info</h2>
        <div>
          <p>
            <strong>Name:</strong> {session.user.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>ID:</strong> {session.user.id}
          </p>
        </div>
        <Button onClick={handleSignOut} variant="destructive">
          Sign Out
        </Button>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Create Organization</h2>
        <Input
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
        <Input
          placeholder="Slug (e.g., my-org)"
          value={orgSlug}
          onChange={(e) => setOrgSlug(e.target.value)}
        />
        <Button onClick={handleCreateOrg} className="w-full">
          Create Organization
        </Button>
      </Card>

      {organizations && organizations.length > 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Your Organizations</h2>
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="p-3 border rounded">
                <p>
                  <strong>{org.name}</strong>
                </p>
                <p className="text-sm text-gray-600">Slug: {org.slug}</p>
                {activeOrg?.id === org.id && (
                  <span className="text-sm text-green-600">✓ Active</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeOrg && (
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Active Organization</h2>
          <p>
            <strong>Name:</strong> {activeOrg.name}
          </p>
          <p>
            <strong>Slug:</strong> {activeOrg.slug}
          </p>
          <p>
            <strong>Your Role:</strong>{" "}
            {activeOrg.members?.find((m: any) => m.userId === session.user.id)
              ?.role || "N/A"}
          </p>
        </Card>
      )}
    </div>
  );
}
