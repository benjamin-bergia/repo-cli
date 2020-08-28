const { Document } = require('yaml');
const { Pair, YAMLMap } = require('yaml/types');


class KubeConfig extends Document {
  constructor(tokens) {
    let content = {
      apiVersion: 'v1',
      kind: 'Config',
      preferences: {},
      clusters: [
        { name: 'prod',
          cluster: {
            server: 'https://137.138.76.49:6443',
            'certificate-authority-data': 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM3VENDQWRXZ0F3SUJBZ0lSQVBxb0YzalNvMEp3aUhSRW9sbmpBa3d3RFFZSktvWklodmNOQVFFTEJRQXcKSGpFY01Cb0dBMVVFQXd3VGFXNXpjR2x5WlMxd2NtOWtMWFl4TVRVek16QWVGdzB5TURBek1EUXhNVEl4TXpGYQpGdzB5TlRBek1EUXhNVEl4TXpGYU1CNHhIREFhQmdOVkJBTU1FMmx1YzNCcGNtVXRjSEp2WkMxMk1URTFNek13CmdnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUMxRkNKWVJBcGtBdmpoTGhPUmNTaXMKeDBiS0dVdXhyWENWZXBHOXl0SVVWZDI0aWxkQjdLdlN1TVNaTkp0U2lNY0FGWWhlU0RJRHZXNExUaDZkWGo1Ygo4QVNPMjY5MmpjSWxaOW1tbVBDUHBnM3hwZkpxWTJ3ZXRid3hUZkczTDRJTjFGNkxUa0VQSUNYMkV1SVRQMkhwCnJMb2FQM2pycWhVbmNLTmxLTzhQZmdvb05KVDM0UE93ZGN1SmVIVEFNMXpBQVdBVGszWVdDbUhmaU9xcFVxR1kKVC9henFTMFpIc29tSkpFelVKQW4yVW1UenNqaDQ3c3dkWVQrRnpNQnhvZno1QS9QMGV6eTFyQ2NmVVA4KzdMUApadHlQMFZoRjhFTVJaUStXMmlJN3Z0YUVybVVDQ0dYQ1p2dlFodHl6OXJWTWdudnUwcTBQQ3pKSlFtQU5GNTVOCkFnTUJBQUdqSmpBa01CSUdBMVVkRXdFQi93UUlNQVlCQWY4Q0FRQXdEZ1lEVlIwUEFRSC9CQVFEQWdJRU1BMEcKQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUEwcFpreXY4Q211bHcvNU9tcS91Yitnc290NGNOUGMwNk5Xa0lIUHZKMApDVWJQUWlmMGpqRnlEOFpGZ2dndER2SE9xSlpRKy9KQkpzdmtLMFFVZUF3S0V0WDRScldEWm5ZMi9ScFhrSnAyClU2VVJ3QzJ1NjFTNjNTZkhGREh2RElSL05MdGcyWG56RU1veHk5NHlxaGN6eWdBblNZY1Z0LzRuaGVLU2dYeE4KeTJuRWROeUJZOFdpY0tyV2VPY3dBWVFJZDNRZzBmYklBSGsxcjd1ZVhrS3dYR08wdDdWcmg5MzdIRStTTlZoNQo4Z2hqZ1hPVmZsZ2NiSFE0RW5DNHdoeHB3M0kyV25zcGlpeE5qK3ErSGZ0WDBwanpNOElSV3dwM2NLZEZnRktZClg5NjFqZ2U1OVlGMW8wUkYxaHF4bnNESlp1LzBhVzEra0NjWXRLQUVmaC9nCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0'
          }
        },
        { name: 'qa',
          cluster: {
            server: 'https://137.138.76.175:6443',
            'certificate-authority-data': 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM2VENDQWRHZ0F3SUJBZ0lSQUt2RUFTV3ZvRVMycUtkZ1R2bmhKYkF3RFFZSktvWklodmNOQVFFTEJRQXcKSERFYU1CZ0dBMVVFQXd3UmFXNXpjR2x5WlMxeFlTMTJNVEUxTXpNd0hoY05NakF3TXpBeE1UQTFPVFV3V2hjTgpNalV3TXpBeE1UQTFPVFV3V2pBY01Sb3dHQVlEVlFRRERCRnBibk53YVhKbExYRmhMWFl4TVRVek16Q0NBU0l3CkRRWUpLb1pJaHZjTkFRRUJCUUFEZ2dFUEFEQ0NBUW9DZ2dFQkFONVFPMGtwUG5XNjBXeFY4MnpHWEJsaWZGcDEKYzRFZDdtNjFXQThKdnN1OHFkWkE5RjFKQWNMS05wUzR6REliMzdxeGdUekFXSDlzUjArZmlRUEdONktKblVXdgp3dEU1TlZnN1h5dGVMdlpUTUNFRXd3ZysrNXVVeUt0N25tbkVpRU5KTTQ3eVlrT3FvUENnYVBsOEdPc2xYa0NPCmNrWU9MZEVWSkUySjI5bnNXUHNFSU1DMlZRVXF4WnovVFRYVC9UK09Ta2FkYTBDTHkxMEF1aEM4a2lldDVvaU8KOTF0U3hPeVRUaUYrQ2p1bVVZWGVYenNDM2tWKzJGeEQwV3E2TmdJcXo2WHdnODFvOGc0K0FCWjFkS2FJRkpKdwpzRyt1dkREUTM3UnZoQVdpQzVsMFh3dnM4am5DUXhDWVJzK21wMGJTN05zT2hRelZUZUZFZ3JqYWN1VUNBd0VBCkFhTW1NQ1F3RWdZRFZSMFRBUUgvQkFnd0JnRUIvd0lCQURBT0JnTlZIUThCQWY4RUJBTUNBZ1F3RFFZSktvWkkKaHZjTkFRRUxCUUFEZ2dFQkFGVnAyMHhGT2JyTklZMHdjMDBRT0x3OUd4bm9VamhKTWFxRThpQ0FqYUo2ZVp6WQpYL090Vzd3aDRXcndZTDVRYUFZWldMTjlZOGV6N1hTaktrc2FSRnhhaUtkUjZqcGxFb1d1dGQrdnJHT1pqbCtLCjh6RzVVWGN2SHhRdDl0NEFMbUNuMWpPQmd0NXBLRU00bHBIT2d6T1R3U0hKaS82ZEZRWTVNNmVDVGJ1WFM1dVQKNFpEYmhzT3FwbDgybHBFR0dSWjUzdE8zRjhVaDllMUhuRnByUThJSkJvNmdUcTNFcTA4Vk9zeXNhc2YwdmpCSAphdTdEV3pMTUxPZERwaCt0Um1WUU9vMHFZYXVkcHI3L3RmakJjUS9MWUZtcnliYmY1WVJnY09jK2dTZDVCNThGCnpURFpNOE1OekdLUFNrcHF5NzhDVFJxdWdueVhSS0dLb1J5WmdBZz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ'
          }
        }
      ],
      contexts: [
        { name: 'inspire-prod',
          context: {
            cluster: 'prod',
            namespace: 'inspire-prod',
            user: 'inspire-prod'
          }
        },
        { name: 'inspire-qa',
          context: {
            cluster: 'qa',
            namespace: 'inspire-qa',
            user: 'inspire-qa'
          }
        },
        { name: 'hepdata-prod',
          context: {
            cluster: 'prod',
            namespace: 'hepdata-prod',
            user: 'hepdata-prod'
          }
        },
        { name: 'hepdata-qa',
          context: {
            cluster: 'qa',
            namespace: 'hepdata-qa',
            user: 'hepdata-qa'
          }
        }
      ],
      users: []
    };

    if (tokens) {
      tokens.forEach((t) => {
        const [namespace, token] = t.split('=');

        content.users.push({
          name: namespace,
          user: {
            token: token
          }
        });
      });
    };

    super(content);
    this.directivesEndMarker = true;
  };
};



module.exports = {
  KubeConfig
};
